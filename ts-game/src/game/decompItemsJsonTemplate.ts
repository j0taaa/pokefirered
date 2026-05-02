import itemsJsonTemplateSource from '../../../src/data/items.json.txt?raw';

export interface ItemsJsonTemplateMetadata {
  directives: string[];
  itemStructFields: string[];
  tmCaseMoveDescriptionExtern: string;
  itemDescriptionDeclaration: string;
  itemNoneDescriptionDeclaration: string;
}

export const ITEMS_JSON_TEMPLATE_SOURCE = itemsJsonTemplateSource;

export const parseItemsJsonTemplateMetadata = (source: string): ItemsJsonTemplateMetadata => {
  const directives = [...source.matchAll(/^##\s*(.+)$/gmu)].map((match) => match[1]);
  const itemStructFields = [...source.matchAll(/^\s+\.([A-Za-z0-9_]+)\s*=/gmu)].map((match) => match[1]);
  const tmCaseMoveDescriptionExtern = source.match(/extern const u8 (gMoveDescription_\{\{ item\.moveId \}\}\[\]);/u)?.[1];
  const itemDescriptionDeclaration = source.match(/const u8 (gItemDescription_\{\{ item\.itemId \}\}\[\]) = _\("\{\{ item\.description_english \}\}"\);/u)?.[1];
  const itemNoneDescriptionDeclaration = source.match(/const u8 (gItemDescription_ITEM_NONE\[\]) = _\("\?\?\?\?\?"\);/u)?.[1];

  if (!tmCaseMoveDescriptionExtern || !itemDescriptionDeclaration || !itemNoneDescriptionDeclaration) {
    throw new Error('Unable to parse items.json.txt description declarations');
  }

  return {
    directives,
    itemStructFields,
    tmCaseMoveDescriptionExtern,
    itemDescriptionDeclaration,
    itemNoneDescriptionDeclaration
  };
};

export const ITEMS_JSON_TEMPLATE_METADATA = parseItemsJsonTemplateMetadata(itemsJsonTemplateSource);
