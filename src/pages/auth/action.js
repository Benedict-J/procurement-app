import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { verifyPasswordResetCode, checkActionCode, getAuth, applyActionCode } from "firebase/auth"; // Untuk verifikasi oobCode
import { message, Spin } from "antd";
import BlankLayout from "@/components/Layout/BlankLayout";
import { auth } from "@/firebase/firebase"; // Import Firebase auth instance

const ActionHandler = () => {
    const router = useRouter();
    const { mode, oobCode } = router.query;
    const [loading, setLoading] = useState(true); // State untuk loading status

    useEffect(() => {
        const handleAction = async () => {
            if (!oobCode || !mode) {
                // Jika tidak ada oobCode atau mode, redirect ke error page
                return;
            }

            try {
                if (mode === 'resetPassword') {
                    // Verifikasi oobCode untuk reset password
                    await verifyPasswordResetCode(auth, oobCode);
                    router.push(`/auth/forgot-password/reset-password?oobCode=${oobCode}`);
                } else if (mode === 'verifyEmail') {
                    // Verifikasi oobCode untuk verifikasi email
                    await applyActionCode(auth, oobCode); // Pastikan verifikasi email diterapkan

                    // Pastikan pengguna melakukan reload untuk memperbarui status emailVerified
                    const user = auth.currentUser;
                    if (user) {
                        await user.reload(); // Reload user untuk memastikan status terupdate
                        if (user.emailVerified) {
                            message.success("Email telah diverifikasi. Silakan login.");
                            router.push(`/auth/login`);
                        } else {
                            message.error("Email belum diverifikasi. Silakan coba lagi.");
                        }
                    } else {
                        // Redirect ke login jika user tidak ditemukan
                        router.push(`/auth/login`);
                    }
                }
            } catch (error) {
                message.error("Invalid or expired action code. Please try again.");
                router.push("/error");
            } finally {
                setLoading(false); // Hentikan loading setelah verifikasi selesai
            }
        };

        if (router.isReady) {
            handleAction();
        }
    }, [mode, oobCode, router.isReady]);

    return (
        <BlankLayout>
            {/* Tampilkan Spin jika sedang loading, jika tidak tampilkan konten */}
            <Spin spinning={loading} tip="Loading...">
                {/* Konten Anda yang ingin ditampilkan ketika tidak sedang loading */}
                <div style={{ minHeight: "100vh" }}>
                    {loading ? "Memproses permintaan..." : "Proses selesai!"}
                </div>
            </Spin>
        </BlankLayout>
    );// Tampilkan loading spinner jika diperlukan
};

ActionHandler.getLayout = (page) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default ActionHandler;