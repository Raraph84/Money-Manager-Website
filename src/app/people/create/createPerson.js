"use client";

import { Component, createRef } from "react";
import { useRouter } from "next/navigation";
import { Loading, Info } from "../../../utils";
import { createPerson } from "../../../api";

class CreatePerson extends Component {

    constructor(props) {

        super(props);

        this.nameInputRef = createRef();

        this.state = { requesting: false, info: null };
    }

    render() {

        const createHandler = () => {

            this.setState({ requesting: true, info: null });
            createPerson({ name: this.nameInputRef.current.value }).then((id) => {
                this.props.router.push("/people");
            }).catch((error) => {
                if (error === "Name must be between 2 and 50 characters")
                    this.setState({ requesting: false, info: <Info>Le nom doit contenir entre 2 et 50 caractères !</Info> }, () => this.nameInputRef.current.focus());
                else
                    this.setState({ requesting: false, info: <Info>Un problème est survenu !</Info> });
            });
        };

        return <div className="form-page">

            <div className="page-title">Créer une personne</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            <div>Nom</div>
            <input ref={this.nameInputRef} disabled={this.state.requesting} autoFocus
                onKeyDown={(event) => event.key === "Enter" && createHandler()} />

            <button disabled={this.state.requesting} onClick={createHandler}>Créer</button>

        </div>;
    }
}

export default (props) => <CreatePerson {...props} router={useRouter()} />;
