import { computed, ref, watch } from 'vue';
import axios from 'axios';
import { MessagingUploadFileResponse, UploadedFile } from '@/types/API';
import Messenger from '@/libs/Messenger';
import { ChatSettings, FileType, WidgetDataMessageType, WidgetFile, LoadStateType } from '@/types/KitWidgetTypes';
import i18n from '@/i18n';

const { t } = i18n.global;

export const downloadFileByURL = (uri: string): void => {
  const link = document.createElement('a');
  link.download = window.name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getFileSize = (sizeInBytes: number): string => {
  let fileSize = sizeInBytes / 1024;
  let sizeMeasure = t('file_size_kb');

  if (fileSize >= 1024) {
    fileSize = fileSize / 1024;
    sizeMeasure = t('file_size_mb');
  }
  const size = parseFloat(fileSize.toFixed(2));
  return `${size} ${sizeMeasure}`;
};
export const getFileExt = (fileName: string): string => {
  const reg = /(?:\.([^.]+))?$/;
  return reg.exec(fileName)?.[1] ?? '';
};
export const messageData = ref<WidgetDataMessageType>({
  files: null,
  text: '',
});
const isDeleteInProcessing = ref<boolean>(false);

export const uploadState = ref<{
  filesCount: number;
  loadState: LoadStateType;
}>({
  filesCount: 0,
  loadState: 'none',
});
const resetUploadState = (): void => {
  uploadState.value.filesCount = 0;
  uploadState.value.loadState = 'none';
};
export const widgetFiles = ref<WidgetFile[]>([]);
const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
const generateFilePreview = async (file: File): Promise<WidgetFile> => {
  const id = `${file.name}${file.size}`;
  const [type] = file.type.split('/') || [''];
  const fileURL = await getBase64(file);
  return {
    id,
    name: file.name,
    size: file.size,
    type: type as FileType,
    url: fileURL,
    objectFile: file,
  };
};
const serializeAllFiles = async (files: File[]): Promise<WidgetFile[]> => {
  const filesArr = Array.from(files || []);
  return Promise.all(filesArr.map(generateFilePreview));
};
export const totalFiles = computed(() => {
  return widgetFiles.value?.length || 0;
});
export const uploadFile = async (file: File, chatSettings: ChatSettings | null): Promise<UploadedFile | null> => {
  const token = chatSettings?.token;
  const uuid = chatSettings?.channel_uuid;
  const host = chatSettings?.host || '';
  const formData = new FormData();
  formData.append('channel_type', 'webchat');
  formData.append('channel_uuid', uuid + '');
  formData.append('token', token + '');
  formData.append('file', file);

  uploadState.value.loadState = 'uploading';

  try {
    const apiURL = host.replace('-im', 'api');
    const { data } = await axios.post<MessagingUploadFileResponse>(
      `https://${apiURL}/api/v3/messaging/uploadFile`,
      formData
    );
    uploadState.value.filesCount++;

    const result = data.result;
    return {
      id: result.id,
      base_name: result.data.base_name,
      extension: result.data.extension,
      mime_type: result.data.mime_type,
      size: result.data.size,
      type: result.data.type,
      duration: result.data.duration,
      name: result.data.base_name + '.' + result.data.extension,
    };
  } catch (error) {
    uploadState.value.loadState = 'error';
    setTimeout(() => {
      messageData.value.files = [];
      resetUploadState();
    }, 3000);
    return null;
  }
};
export const getUploadFilePromises = (
  files: WidgetFile[],
  chatSettings: ChatSettings | null
): Promise<UploadedFile | null>[] => {
  return files.map((file) => {
    return uploadFile(file.objectFile, chatSettings);
  });
};

export const sendMessage = async (text: string, chatSettings: ChatSettings | null): Promise<void> => {
  const filesPromises = getUploadFilePromises(widgetFiles.value, chatSettings);
  const resultFiles = await Promise.all(filesPromises);
  const isResultFailed = resultFiles.some((file) => !file);
  if (widgetFiles.value.length) uploadState.value.loadState = isResultFailed ? 'error' : 'completed';
  const uploadedFiles = resultFiles.filter((obj: UploadedFile) => !!obj) as UploadedFile[];

  const filesForSocket = uploadedFiles.map((file) => {
    return {
      file_id: file.id,
      file_name: file.base_name,
      file_size: file.size,
      mime_type: file.mime_type,
      type: file.type,
    };
  });
  const filesForFront = widgetFiles.value;
  Messenger.get().sendMessage(text.trim(), filesForSocket, filesForFront);
  setTimeout(() => {
    messageData.value.files = [];
    resetUploadState();
  }, 3000);
};

export const deleteFile = (index: number): void => {
  if (messageData.value.files) {
    isDeleteInProcessing.value = true;
    messageData.value.files = messageData.value.files.filter((file: File, ind) => ind !== index);
  }
};

watch(
  () => messageData.value.files,
  async (files: File[] | null) => {
    if (!files) return;
    if (files.length <= 10) {
      if (!isDeleteInProcessing.value) uploadState.value.loadState = 'processing';
      widgetFiles.value = await serializeAllFiles(files).catch(() => []);
      isDeleteInProcessing.value = false;
      resetUploadState();
      return;
    }
    uploadState.value.loadState = 'toManyFiles';
    setTimeout(() => {
      if (messageData.value.files) messageData.value.files = messageData.value.files.slice(0, 10);
      resetUploadState();
    }, 1000);
  }
);
