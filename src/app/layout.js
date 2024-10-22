import Link from "next/link";

import "./styles/globals.scss";

export const metadata = {
    template: "%s | Money Manager",
    default: "Money Manager"
};

export default ({ children }) => <html lang="fr">
    <head>
        <link href="https://files.raraph.fr/fontawesome-free-web/css/all.min.css" rel="stylesheet" />
    </head>

    <body>
        <header>
            <Link href="/inflows">Entrées</Link>
            <Link href="/outflows">Sorties</Link>
            <Link href="/businesses">Entreprises</Link>
            <Link href="/people">Personnes</Link>
        </header>

        <main>{children}</main>
    </body>
</html>;
