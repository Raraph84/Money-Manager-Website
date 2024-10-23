"use client";

import { Component } from "react";
import { usePathname } from "next/navigation";
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
        return <header>
            <Link href="/">Accueil</Link>
            <Link href="/inflows">Entrées</Link>
            <Link href="/outflows">Sorties</Link>
            <Link href="/people">Personnes</Link>
            <Link href="/accounts">Comptes</Link>
            <Link href="/businesses">Entreprises</Link>
        </header>;
    }
}

export const Header = (props) => <HeaderClass {...props} pathname={usePathname()} />;
