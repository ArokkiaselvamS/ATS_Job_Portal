import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../../utils/prisma';
import { hashPassword } from '../../utils/password';
import { createAuditLog } from '../../services/audit.service';
import { createNotification } from '../../services/notification.service';

const registerCompanySchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  officialEmail: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  industry: z.string().min(1, 'Industry is required'),
  companySize: z.string().min(1, 'Company size is required'),
  foundedYear: z.string().optional().refine(val => {
    if (!val) return true;
    const year = parseInt(val);
    const currentYear = new Date().getFullYear();
    return !isNaN(year) && year >= 1800 && year <= currentYear;
  }, 'Please enter a valid year'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  contactName: z.string().min(1, 'Contact person name is required'),
  designation: z.string().optional(),
  contactPhone: z.string().min(1, 'Contact phone is required')
    .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, 'Please enter a valid phone number'),
  contactEmail: z.string().email('Please enter a valid email address'),
});

export const registerCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bodyData: any = { ...req.body };

    if (bodyData.foundedYear === '') bodyData.foundedYear = undefined;
    if (bodyData.website === '') bodyData.website = undefined;
    if (bodyData.designation === '') bodyData.designation = undefined;

    const data = registerCompanySchema.parse(bodyData);

    const existingCompany = await prisma.company.findFirst({
      where: { officialEmail: data.officialEmail },
    });

    if (existingCompany) {
      res.status(400).json({ success: false, message: 'A company with this email already exists' });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.officialEmail },
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'A user with this email already exists' });
      return;
    }

    const hashedPassword = await hashPassword(data.password);

    let logoUrl: string | undefined;
    if (req.file) {
      const uploadsDir = 'uploads/companies';
      const fs = await import('fs');
      const path = await import('path');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      logoUrl = `/uploads/companies/${fileName}`;
    }

    const company = await prisma.company.create({
      data: {
        name: data.companyName,
        officialEmail: data.officialEmail,
        passwordHash: hashedPassword,
        logo: logoUrl,
        industry: data.industry,
        companySize: data.companySize,
        foundedYear: data.foundedYear ? parseInt(data.foundedYear) : null,
        website: data.website || null,
        description: data.description,
        country: data.country,
        state: data.state,
        city: data.city,
        address: data.address,
        contactName: data.contactName,
        designation: data.designation || null,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        verificationStatus: 'PENDING',
      },
    });

    const tempReferralCode = 'COMP' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 6).toUpperCase();

    const user = await prisma.user.create({
      data: {
        firstName: data.contactName.split(' ')[0] || 'Admin',
        lastName: data.contactName.split(' ').slice(1).join(' ') || 'User',
        email: data.officialEmail,
        passwordHash: hashedPassword,
        phone: data.contactPhone,
        role: 'COMPANY_ADMIN',
        isEmailVerified: false,
        referralCode: tempReferralCode,
      },
    });

    const referralCode = (data.contactName.split(' ')[0].substring(0, 2) + data.contactName.split(' ').slice(1).join(' ').substring(0, 2)).toUpperCase() + String(user.id).padStart(4, '0');
    await prisma.user.update({ where: { id: user.id }, data: { referralCode } });

    await prisma.companyAdmin.create({
      data: {
        userId: user.id,
        companyId: company.id,
        role: 'admin',
      },
    });

    await createAuditLog({
      adminId: user.id,
      action: 'COMPANY_REGISTERED',
      entityType: 'Company',
      entityId: company.id,
      newValue: { companyId: company.id, name: company.name, status: 'PENDING' },
    });

    await createNotification({
      userId: user.id,
      type: 'COMPANY_APPROVED',
      title: 'Company Registration Submitted',
      message: `Your company "${company.name}" has been submitted for verification. You will be notified once approved.`,
      entityType: 'Company',
      entityId: company.id,
    });

    res.status(201).json({
      success: true,
      message: 'Company registration submitted successfully. Your company is pending verification.',
      data: {
        companyId: company.id,
        companyName: company.name,
        verificationStatus: company.verificationStatus,
      },
    });
  } catch (error) {
    console.error('Company registration error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    next(error);
  }
};

export const getMyCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const companyAdmin = await prisma.companyAdmin.findFirst({
      where: { userId },
      include: {
        company: true,
      },
    });

    if (!companyAdmin || !companyAdmin.company) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }

    const company = companyAdmin.company;

    res.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        logo: company.logo,
        industry: company.industry,
        companySize: company.companySize,
        foundedYear: company.foundedYear,
        website: company.website,
        description: company.description,
        country: company.country,
        state: company.state,
        city: company.city,
        address: company.address,
        contactName: company.contactName,
        designation: company.designation,
        contactPhone: company.contactPhone,
        contactEmail: company.contactEmail,
        verificationStatus: company.verificationStatus,
        verifiedAt: company.verifiedAt,
        isSuspended: company.isSuspended,
        createdAt: company.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};