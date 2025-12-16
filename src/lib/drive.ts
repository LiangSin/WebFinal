import { google } from 'googleapis';
import { Readable } from 'stream';

export async function uploadToDrive(file: File, folderId?: string) {
  try {
    const clientId = process.env.ADMIN_DRIVE_CLIENT_ID;
    const clientSecret = process.env.ADMIN_DRIVE_CLIENT_SECRET;
    const refreshToken = process.env.ADMIN_DRIVE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error("Missing Google OAuth credentials (CLIENT_ID, CLIENT_SECRET, or REFRESH_TOKEN)");
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata: any = {
      name: file.name,
    };
    
    const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (targetFolderId) {
        fileMetadata.parents = [targetFolderId];
    }

    const media = {
      mimeType: file.type,
      body: stream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    return {
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
    };
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}
