import { PartialUserObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export interface NotionProperties {
  Title?: { title?: { plain_text: string }[] };
  Description?: { rich_text?: { plain_text: string }[] };
  Tags?: { multi_select?: { name: string }[] };
  Author?: { people: PartialUserObjectResponse[] };
  Date?: { date?: { start: string } };
  'Modified Date'?: { date?: { start: string } };
  Slug?: { rich_text?: { plain_text: string }[] };
}

export interface NotionUser {
  object: 'user';
  id: string;
  type?: 'person' | 'bot';
  name?: string;
  avatar_url?: string;
  person?: {
    email?: string;
  };
}
