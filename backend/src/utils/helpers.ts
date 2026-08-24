export function getParamId(req: any): number {
  return parseInt(String(req.params.id));
}

export function getQueryParam(req: any, key: string, defaultValue?: string): string | undefined {
  const val = req.query[key];
  if (val === undefined || val === null) return defaultValue;
  return String(val);
}
