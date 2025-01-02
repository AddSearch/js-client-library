import axios from 'axios';
import { AxiosResponse } from 'axios';
import { base64 } from './util';
import { SearchResponse } from './apifetch';

interface ApiResponse {
  status: number;
  text: string;
}

export interface IndexingDocument {
  id?: string;
  url?: string;
  title?: string;
  main_content?: string;
  custom_fields?: Record<string, string | number>;
}

const getHeaders = (sitekey: string, privatekey: string): Record<string, string> => {
  return {
    'Authorization': 'Basic ' + base64(sitekey + ':' + privatekey),
    'Content-Type': 'application/json'
  };
};

/**
 * Fetch document
 */
const getDocument = (
  apiHostname: string,
  sitekey: string,
  privatekey: string,
  id: string
): Promise<SearchResponse> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://${apiHostname}/v2/indices/${sitekey}/documents/${id}`, {
        headers: getHeaders(sitekey, privatekey)
      })
      .then((response: AxiosResponse) => {
        if (response.status === 200) {
          resolve(response.data as SearchResponse);
        } else {
          reject(new Error(JSON.stringify({ status: response.status, text: response.statusText })));
        }
      })
      .catch((error) => {
        reject(new Error(JSON.stringify({ status: 400, text: error as string })));
      });
  });
};

/**
 * Add document
 */
const saveDocument = (
  apiHostname: string,
  sitekey: string,
  privatekey: string,
  document: IndexingDocument
): Promise<ApiResponse> => {
  const isPut = Boolean(document.id || document.url);

  return new Promise((resolve, reject) => {
    axios({
      url: `https://${apiHostname}/v2/indices/${sitekey}/documents/`,
      method: isPut ? 'put' : 'post',
      headers: getHeaders(sitekey, privatekey),
      data: document
    })
      .then((response: AxiosResponse) => {
        if (response.status === 202) {
          resolve({ status: response.status, text: response.statusText });
        } else {
          reject(new Error(JSON.stringify({ status: response.status, text: response.statusText })));
        }
      })
      .catch((error) => {
        reject(new Error(JSON.stringify({ status: 400, text: error as string })));
      });
  });
};

/**
 * Batch add documents
 */
const saveDocumentsBatch = (
  apiHostname: string,
  sitekey: string,
  privatekey: string,
  documents: { documents: IndexingDocument[] }
): Promise<ApiResponse> => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'put',
      url: `https://${apiHostname}/v2/indices/${sitekey}/documents:batch`,
      headers: getHeaders(sitekey, privatekey),
      data: documents
    })
      .then((response: AxiosResponse) => {
        if (response.status === 202) {
          resolve({ status: response.status, text: response.statusText });
        } else {
          reject(new Error(JSON.stringify({ status: response.status, text: response.statusText })));
        }
      })
      .catch((error) => {
        reject(new Error(JSON.stringify({ status: 400, text: error as string })));
      });
  });
};

/**
 * Delete document
 */
const deleteDocument = (
  apiHostname: string,
  sitekey: string,
  privatekey: string,
  id: string
): Promise<ApiResponse> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`https://${apiHostname}/v2/indices/${sitekey}/documents/${id}`, {
        headers: getHeaders(sitekey, privatekey)
      })
      .then((response: AxiosResponse) => {
        if (response.status === 202) {
          resolve({ status: response.status, text: response.statusText });
        } else {
          reject(new Error(JSON.stringify({ status: response.status, text: response.statusText })));
        }
      })
      .catch((error) => {
        reject(new Error(JSON.stringify({ status: 400, text: error as string })));
      });
  });
};

/**
 * Batch delete documents
 */
const deleteDocumentsBatch = (
  apiHostname: string,
  sitekey: string,
  privatekey: string,
  batch: { documents: string[] }
): Promise<ApiResponse> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`https://${apiHostname}/v2/indices/${sitekey}/documents:batch`, {
        headers: getHeaders(sitekey, privatekey),
        data: batch
      })
      .then((response: AxiosResponse) => {
        if (response.status === 202) {
          resolve({ status: response.status, text: response.statusText });
        } else {
          reject(new Error(JSON.stringify({ status: response.status, text: response.statusText })));
        }
      })
      .catch((error) => {
        reject(new Error(JSON.stringify({ status: 400, text: error as string })));
      });
  });
};

export { getDocument, saveDocument, saveDocumentsBatch, deleteDocument, deleteDocumentsBatch };
