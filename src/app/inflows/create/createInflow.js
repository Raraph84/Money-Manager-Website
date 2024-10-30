"use client";

import { Component, createRef } from "react";
import { useRouter } from "next/navigation";
import { Loading, CreateInflowForm } from "../../../utils";

class CreateInflow extends Component {

    constructor(props) {

        super(props);

        this.formRef = createRef();

        this.state = { requesting: false, info: null };
    }

    render() {

        const createHandler = () => {
            this.setState({ requesting: true, info: null });
            this.formRef.current.create()
                .then(({ id }) => this.props.router.push("/inflows/" + id))
                .catch(({ info, cb }) => this.setState({ requesting: false, info }, cb));
        };

        return <div>

            <div className="page-title">Créer une entrée</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            <div className="form">
                <CreateInflowForm ref={this.formRef} disabled={this.state.requesting} autoFocus onEnter={createHandler} />
                <button disabled={this.state.requesting} onClick={createHandler}>Créer</button>
            </div>

        </div>;
    }
}

export default (props) => <CreateInflow {...props} router={useRouter()} />;
