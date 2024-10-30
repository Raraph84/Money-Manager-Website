"use client";

import { Component, createRef } from "react";
import { useRouter } from "next/navigation";
import { Loading, CreateFlowForm } from "../../../utils";

class CreateFlow extends Component {

    constructor(props) {

        super(props);

        this.formRef = createRef();

        this.state = { requesting: false, info: null };
    }

    render() {

        const createHandler = () => {
            this.setState({ requesting: true, info: null });
            this.formRef.current.create()
                .then(({ id }) => this.props.router.push("/flows/" + id))
                .catch(({ info, cb }) => this.setState({ requesting: false, info }, cb));
        };

        return <div>

            <div className="page-title">Créer une transaction</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            <div className="form">
                <CreateFlowForm ref={this.formRef} disabled={this.state.requesting} autoFocus onEnter={createHandler} />
                <button disabled={this.state.requesting} onClick={createHandler}>Créer</button>
            </div>

        </div>;
    }
}

export default (props) => <CreateFlow {...props} router={useRouter()} />;
