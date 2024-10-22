import type { AppProps } from "next/app";
import MainLayout from "@components/Layout/MainLayout";
import type { Page } from "@/types/page";
import "@/styles/globals.scss";
import "@/contexts/UserContext";
import dynamic from "next/dynamic";
import { UserProvider } from "@/contexts/UserContext";

type Props = AppProps & {
  Component: Page;
};

const App = ({ Component, pageProps }: Props) => {
  // If your page has a layout defined, use it. Otherwise, use the default layout.
  let getLayout =
    Component.getLayout || ((page: any) => <MainLayout>{page}</MainLayout>);

    return (
      <UserProvider> {/* Bungkus aplikasi dengan UserProvider */}
        {getLayout(
          <div>
            <Component {...pageProps} />
          </div>
        )}
      </UserProvider>
    );
};

export default App;
