"use client";

import { Component } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "../../api";
import Link from "next/link";

class HeaderClass extends Component {

    constructor(props) {

        super(props);

        this.state = { logged: true };
    }

    componentDidMount() {
        this.setState({ logged: !!localStorage.getItem("token") });
    }

    componentDidUpdate(prevProps) {
        if (this.props.pathname !== prevProps.pathname)
            this.setState({ logged: !!localStorage.getItem("token") });
    }

    render() {

        if (!this.state.logged) return null;

        const logoutHandler = () => {
            if (!confirm("Voulez-vous vraiment vous déconnecter ?")) return;
            logout().then(() => {
                localStorage.removeItem("token");
                this.props.router.push("/login");
            }).catch(() => { });
        };

        return <header>
            <Link href="/">Accueil</Link>
            <Link href="/flows">Transactions</Link>
            <Link href="/inflows">Entrées</Link>
            <Link href="/outflows">Sorties</Link>
            <Link href="/people">Personnes</Link>
            <Link href="/accounts">Comptes</Link>
            <Link href="/businesses">Entreprises</Link>
            <button onClick={logoutHandler}>Se déconnecter</button>
        </header>;
    }
}

export const Header = (props) => <HeaderClass {...props} pathname={usePathname()} router={useRouter()} />;
