export type TemplateParameterDefinition = {
  name: string;
  component: 'HEADER' | 'BODY' | 'BUTTON';
  index: number;
  type: 'text';
  buttonIndex?: number;
};

export type WhatsAppTemplate = {
  id: string;
  metaTemplateId: string | null;
  templateName: string;
  languageCode: string;
  category: string;
  approvalStatus: string;
  parameterSchema: { version: 1; parameters: TemplateParameterDefinition[] };
  lastSyncedAt: string;
};

export type TemplateDraft = {
  selectedTemplateId: string;
  templateParameters: Record<string, string>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function shapeParameter(value: unknown): TemplateParameterDefinition | null {
  if (!isRecord(value) || typeof value.name !== 'string' || !value.name ||
      !['HEADER', 'BODY', 'BUTTON'].includes(String(value.component)) ||
      !Number.isInteger(value.index) || Number(value.index) < 1 || value.type !== 'text') return null;
  if (value.component === 'BUTTON' && (!Number.isInteger(value.buttonIndex) || Number(value.buttonIndex) < 0)) return null;
  return {
    name: value.name,
    component: value.component as TemplateParameterDefinition['component'],
    index: Number(value.index),
    type: 'text',
    ...(value.component === 'BUTTON' ? { buttonIndex: Number(value.buttonIndex) } : {}),
  };
}

function shapeTemplate(value: unknown): WhatsAppTemplate | null {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id ||
      typeof value.templateName !== 'string' || !value.templateName ||
      typeof value.languageCode !== 'string' || !value.languageCode ||
      typeof value.category !== 'string' || !value.category ||
      typeof value.approvalStatus !== 'string' ||
      typeof value.lastSyncedAt !== 'string' ||
      !isRecord(value.parameterSchema) || value.parameterSchema.version !== 1 ||
      !Array.isArray(value.parameterSchema.parameters)) return null;
  const parameters = value.parameterSchema.parameters.map(shapeParameter);
  if (parameters.some(parameter => parameter === null)) return null;
  const safeParameters = parameters as TemplateParameterDefinition[];
  if (new Set(safeParameters.map(parameter => parameter.name)).size !== safeParameters.length) return null;
  return {
    id: value.id,
    metaTemplateId: typeof value.metaTemplateId === 'string' ? value.metaTemplateId : null,
    templateName: value.templateName,
    languageCode: value.languageCode,
    category: value.category,
    approvalStatus: value.approvalStatus,
    parameterSchema: { version: 1, parameters: safeParameters },
    lastSyncedAt: value.lastSyncedAt,
  };
}

function responseTemplates(value: unknown): unknown[] {
  return isRecord(value) && Array.isArray(value.templates) ? value.templates : [];
}

export function shapeCachedTemplates(value: unknown): WhatsAppTemplate[] {
  return responseTemplates(value).map(shapeTemplate).filter((item): item is WhatsAppTemplate => item !== null);
}

export function shapeEligibleTemplates(value: unknown): WhatsAppTemplate[] {
  return shapeCachedTemplates(value).filter(template => template.approvalStatus === 'APPROVED');
}

const parameterLabel = (parameter: TemplateParameterDefinition) => {
  const [area, ...nameParts] = parameter.name.split('.');
  const areaLabel = area.charAt(0).toUpperCase() + area.slice(1);
  return `${areaLabel} ${nameParts.join(' ') || parameter.index}`;
};

export function parameterFields(template: WhatsAppTemplate | undefined) {
  return (template?.parameterSchema.parameters ?? []).map(parameter => ({
    name: parameter.name,
    label: parameterLabel(parameter),
    inputType: parameter.type,
  }));
}

export function areTemplateParametersComplete(
  template: WhatsAppTemplate | undefined,
  values: Record<string, string>,
): boolean {
  return Boolean(template) && template!.parameterSchema.parameters.every(parameter => {
    const value = values[parameter.name];
    return typeof value === 'string' && value.trim().length > 0 && value.length <= 1024;
  });
}

export function reconcileTemplateDraft(draft: TemplateDraft, templates: WhatsAppTemplate[]): TemplateDraft {
  const selected = templates.find(template => template.id === draft.selectedTemplateId);
  if (!selected) return { selectedTemplateId: '', templateParameters: {} };
  const templateParameters = Object.fromEntries(selected.parameterSchema.parameters.flatMap(parameter =>
    typeof draft.templateParameters[parameter.name] === 'string'
      ? [[parameter.name, draft.templateParameters[parameter.name]!]]
      : [],
  ));
  return { selectedTemplateId: selected.id, templateParameters };
}
