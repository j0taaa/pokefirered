import unionRoomSource from '../../../src/data/union_room.h?raw';

export interface DesignatedValue {
  index: string;
  value: string;
}

export interface WindowTemplateData {
  symbol: string;
  fields: Record<string, string>;
}

export interface ListMenuItemData {
  text: string;
  value: string;
}

export interface ListMenuItemsTable {
  symbol: string;
  items: ListMenuItemData[];
}

export interface ListMenuTemplateData {
  symbol: string;
  fields: Record<string, string>;
}

export interface AcceptedActivityIds {
  symbol: string;
  ids: string[];
}

export const UNION_ROOM_DATA_SOURCE = unionRoomSource;

const stripLineComments = (source: string): string => source.replace(/\/\/.*$/gmu, '');

const parseFields = (body: string): Record<string, string> =>
  Object.fromEntries(
    [...body.matchAll(/^\s*\.(\w+)\s*=\s*([^,\n]+),?$/gmu)].map((match) => [match[1], match[2].trim()])
  );

const parseTokens = (body: string): string[] =>
  stripLineComments(body)
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);

export const parseDesignatedValues = (source: string, symbol: string): DesignatedValue[] => {
  const block = [...source.matchAll(/^(?:static\s+)?const\s+(?:u8 \*const|u8|u32)\s+(\w+)[^=]*=\s*\{([\s\S]*?)^\};/gmu)].find(
    (match) => match[1] === symbol
  );
  const body = block?.[2];
  if (!body) {
    return [];
  }

  return [...body.matchAll(/^\s*\[([^\]]+)\]\s*=\s*(.+?)(?:,)?$/gmu)].map((match) => ({
    index: match[1].trim(),
    value: match[2].trim()
  }));
};

export const parseUnionRoomWindowTemplates = (source: string): WindowTemplateData[] =>
  [...source.matchAll(/^static const struct WindowTemplate (\w+)\s*=\s*\{([\s\S]*?)^\};/gmu)].map((match) => ({
    symbol: match[1],
    fields: parseFields(match[2])
  }));

export const parseUnionRoomListMenuItems = (source: string): ListMenuItemsTable[] =>
  [...source.matchAll(/^(?:static )?const struct ListMenuItem (\w+)\[[^\]]*\]\s*=\s*\{([\s\S]*?)^\};/gmu)].map(
    (match) => ({
      symbol: match[1],
      items: [...match[2].matchAll(/^\s*\{\s*([^,]+),\s*([^}]+?)\s*\},?/gmu)].map((item) => ({
        text: item[1].trim(),
        value: item[2].trim()
      }))
    })
  );

export const parseUnionRoomListMenuTemplates = (source: string): ListMenuTemplateData[] =>
  [...source.matchAll(/^static const struct ListMenuTemplate (\w+)\s*=\s*\{([\s\S]*?)^\};/gmu)].map((match) => ({
    symbol: match[1],
    fields: parseFields(match[2])
  }));

export const parseUnionRoomAcceptedActivityIdArrays = (source: string): AcceptedActivityIds[] =>
  [...source.matchAll(/^ALIGNED\(4\) static const u8 (\w+)\[\]\s*=\s*\{([\s\S]*?)\};/gmu)].map((match) => ({
    symbol: match[1],
    ids: parseTokens(match[2])
  }));

export const parseUnionRoomStringLiteral = (source: string, symbol: string): string | undefined =>
  [...source.matchAll(/^static const u8 (\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gmu)].find(
    (match) => match[1] === symbol
  )?.[2];

export const sLinkGroupActivityNameTexts = parseDesignatedValues(unionRoomSource, 'sLinkGroupActivityNameTexts');
export const sLinkGroupToActivityAndCapacity = parseDesignatedValues(unionRoomSource, 'sLinkGroupToActivityAndCapacity');
export const sAcceptedActivityIds = parseDesignatedValues(unionRoomSource, 'sAcceptedActivityIds');
export const sLinkGroupToURoomActivity = parseDesignatedValues(unionRoomSource, 'sLinkGroupToURoomActivity');

export const UNION_ROOM_WINDOW_TEMPLATES = parseUnionRoomWindowTemplates(unionRoomSource);
export const UNION_ROOM_LIST_MENU_ITEMS = parseUnionRoomListMenuItems(unionRoomSource);
export const UNION_ROOM_LIST_MENU_TEMPLATES = parseUnionRoomListMenuTemplates(unionRoomSource);
export const UNION_ROOM_ACCEPTED_ACTIVITY_ID_ARRAYS = parseUnionRoomAcceptedActivityIdArrays(unionRoomSource);
export const sDotSeparatedValues = parseUnionRoomStringLiteral(unionRoomSource, 'sDotSeparatedValues') ?? '';

export const hasUnionRoomDummyRfuPlayerData = /static const struct RfuPlayerData sRfuPlayerData_Dummy = \{\};/u.test(
  unionRoomSource
);
