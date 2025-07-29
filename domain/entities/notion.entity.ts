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
