import { Header } from "./layout/layout";

import "./layout/globals.scss";

export const metadata = {
    title: {
        template: "%s | Money Manager",
        default: "Money Manager"
    }
};

export default ({ children }) => <html lang="fr">
    <head>
        <link href="https://files.raraph.fr/fontawesome-free-web/css/all.min.css" rel="stylesheet" />
    </head>

    <body>
        <Header />
        <main>{children}</main>
    </body>
</html>;
