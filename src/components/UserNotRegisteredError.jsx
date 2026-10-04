export default function UserNotRegisteredError() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md text-center space-y-3">
                <h1 className="text-xl font-semibold">アカウントが登録されていません</h1>
                <p className="text-sm text-muted-foreground">
                    このアプリへのアクセス権がありません。管理者にお問い合わせください。
                </p>
            </div>
        </div>
    );
}
