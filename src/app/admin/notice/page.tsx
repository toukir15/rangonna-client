import NoticeClient from "@admin/components/pages/Notice/NoticeClient";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";


export default function Page() {
    return (
        <AuthLayout>
            <NoScrollLayout>
                <NoticeClient />
            </NoScrollLayout>
        </AuthLayout>
    );
}