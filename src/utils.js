import { Component, createRef } from "react";
import { createAccount, createBusiness, createPerson } from "./api";
import Link from "next/link";

export const Loading = () => <div className="loading">Chargement...</div>;

export const Info = ({ children }) => <div className="info">{children}</div>;

export const LinkedTr = ({ children, href }) => <tr className="linked">
    {(Array.isArray(children) ? children : [children]).map((child, index) => <td key={index}><Link href={href}>{child.props.children}</Link></td>)}
</tr>;

export class CreatePersonForm extends Component {

    constructor(props) {

        super(props);

        this.nameInputRef = createRef();
    }

    async create() {

        let id;
        try {
            id = await createPerson({ name: this.nameInputRef.current.value });
        } catch (error) {
            if (error === "Name must be between 2 and 50 characters")
                throw { info: <Info>Le nom doit contenir entre 2 et 50 caractères !</Info>, cb: () => this.nameInputRef.current.focus() };
            else
                throw { info: <Info>Un problème est survenu !</Info> };
        }

        return id;
    }

    render() {
        return <>
            <div>Nom</div>
            <input ref={this.nameInputRef} disabled={this.props.disabled} autoFocus={this.props.autoFocus}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter()} />
        </>;
    }
}

export class CreateBusinessForm extends Component {

    constructor(props) {

        super(props);

        this.nameInputRef = createRef();
    }

    async create() {

        let id;
        try {
            id = await createBusiness({ name: this.nameInputRef.current.value });
        } catch (error) {
            if (error === "Name must be between 2 and 50 characters")
                throw { info: <Info>Le nom doit contenir entre 2 et 50 caractères !</Info>, cb: () => this.nameInputRef.current.focus() };
            else
                throw { info: <Info>Un problème est survenu !</Info> };
        }

        return id;
    }

    render() {
        return <>
            <div>Nom</div>
            <input ref={this.nameInputRef} disabled={this.props.requesting} autoFocus={this.props.autoFocus}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter()} />
        </>;
    }
}

export class CreateAccountForm extends Component {

    constructor(props) {

        super(props);

        this.nameInputRef = createRef();
    }

    async create() {

        let id;
        try {
            id = await createAccount({ name: this.nameInputRef.current.value });
        } catch (error) {
            if (error === "Name must be between 2 and 50 characters")
                throw { info: <Info>Le nom doit contenir entre 2 et 50 caractères !</Info>, cb: () => this.nameInputRef.current.focus() };
            else
                throw { info: <Info>Un problème est survenu !</Info> };
        }

        return id;
    }

    render() {
        return <>
            <div>Nom</div>
            <input ref={this.nameInputRef} disabled={this.props.requesting} autoFocus={this.props.autoFocus}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter()} />
        </>;
    }
}
