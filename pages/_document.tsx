import Document, {
  Html,
  Head,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from "next/document";
import { loadConfig } from "@config/index";

interface Props extends DocumentInitialProps {
  lang: string;
}

/** Custom document: sets <html lang> from the configured locale. */
export default class MyDocument extends Document<Props> {
  static async getInitialProps(ctx: DocumentContext): Promise<Props> {
    const initialProps = await Document.getInitialProps(ctx);
    let lang = "en";
    try {
      lang = loadConfig().site.locale.split(/[-_]/)[0] ?? "en";
    } catch {
      // Config errors surface on the page itself; keep the default here.
    }
    return { ...initialProps, lang };
  }

  render() {
    return (
      <Html lang={this.props.lang}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
