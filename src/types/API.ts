export type UploadedFile = {
  id: number;
  base_name: string;
  duration: number;
  extension: string;
  mime_type: string;
  size: number;
  type: string;
  name?: string;
};

export type MessagingUploadFileResponse = {
  result: { data: UploadedFile; id: number };
  success: boolean;
};
export type MessagingUploadFileRequest = {
  channel_uuid: string;
  token: string;
  channel_type: 'webchat';
  file: FormData;
};

export type MessagingUploadFile = {
  result: MessagingUploadFileResponse;
  POST: MessagingUploadFileRequest;
  GET: void;
};
