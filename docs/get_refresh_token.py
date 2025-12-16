import sys
import os
from google_auth_oauthlib.flow import InstalledAppFlow

# 權限範圍：僅限由該程式建立的雲端硬碟檔案
SCOPES = ['https://www.googleapis.com/auth/drive.file']

def get_refresh_token(client_secret_file):
    # 檢查檔案是否存在
    if not os.path.exists(client_secret_file):
        print(f"錯誤：找不到檔案 '{client_secret_file}'")
        return

    try:
        flow = InstalledAppFlow.from_client_secrets_file(client_secret_file, SCOPES)

        # access_type='offline' 是取得 Refresh Token 的關鍵
        # prompt='consent' 確保每次執行都會跳出授權畫面並核發新的 Refresh Token
        creds = flow.run_local_server(
            port=0,
            access_type='offline',
            prompt='consent'
        )

        print("\n" + "="*60)
        if creds.refresh_token:
            print("【成功取得 Refresh Token！】")
            print("請複製下方字串並存入你的環境變數 ADMIN_DRIVE_REFRESH_TOKEN 中：")
            print(f"\n{creds.refresh_token}\n")
        else:
            print("【錯誤：未取得 Refresh Token】")
            print("這通常是因為 Google 沒核發新的 Token。")
            print("請到 https://myaccount.google.com/permissions 移除此應用程式的權限後再試一次。")
        print("="*60)
        
    except Exception as e:
        print(f"執行過程中發生錯誤：{e}")

if __name__ == '__main__':
    # 檢查是否提供了參數
    if len(sys.argv) < 2:
        print("使用方式：python get_token.py <你的_client_secret_檔案.json>")
    else:
        get_refresh_token(sys.argv[1])