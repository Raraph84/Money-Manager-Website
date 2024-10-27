import { Component, createRef } from "react";
import { createPerson, createAccount, createBusiness, getPeople, getAccounts, getBusinesses, createInflow, createOutflow, createFlow } from "./api";
import Link from "next/link";

export const Loading = () => {
    window.scrollTo(0, 0);
    return <div className="loading">Chargement...</div>;
};

export const Info = ({ children }) => {
    window.scrollTo(0, 0);
    return <div className="info">{children}</div>;
};

export const LinkedTr = ({ children, href }) => <tr className="linked">
    {(Array.isArray(children) ? children : [children]).map((child, index) => <td key={index}><Link href={href}>{child.props.children}</Link></td>)}
</tr>;

class NameForm extends Component {

    constructor(props) {

        super(props);

        this.nameInputRef = createRef();
    }

    async create() {
        try {
            return await this.props.onCreate({ name: this.nameInputRef.current.value });
        } catch (error) {
            if (error === "Name must be between 2 and 50 characters")
                throw { info: <Info>Le nom doit contenir entre 2 et 50 caractères !</Info>, cb: () => this.nameInputRef.current.focus() };
            else
                throw { info: <Info>Un problème est survenu !</Info> };
        }
    }

    render() {
        return <>
            <div>Nom</div>
            <input ref={this.nameInputRef} disabled={this.props.disabled} autoFocus={this.props.autoFocus}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter()} />
        </>;
    }
}

export const CreatePersonForm = (props) => <NameForm {...props} onCreate={createPerson} />;

export const CreateAccountForm = (props) => <NameForm {...props} onCreate={createAccount} />;

export const CreateBusinessForm = (props) => <NameForm {...props} onCreate={createBusiness} />;

class ChooseForm extends Component {

    constructor(props) {

        super(props);

        this.formRef = createRef();

        this.state = { options: null, selected: null };
    }

    componentDidMount() {
        this.props.getOptions().then((options) => this.setState({ options })).catch(() => { });
    }

    async choose() {

        if (!this.state.selected) throw { info: <Info>Veuillez choisir une {this.props.name.toLowerCase()} !</Info> };

        if (this.state.selected > 0) return this.state.selected;

        const id = await this.formRef.current.create();
        const options = await this.props.getOptions();

        await new Promise((resolve) => this.setState({ options, selected: id }, resolve));

        return id;
    }

    render() {
        return <>

            <div className="choose-title">{this.props.name}</div>

            <div className="choose-list">
                {!this.state.selected ? <>
                    <button disabled={this.props.disabled} onClick={() => this.setState({ selected: -1 })}>Créer</button>
                    {this.state.options?.map((option) => <button key={option.id} disabled={this.props.disabled}
                        onClick={() => this.setState({ selected: option.id }, this.props.onEnter)}>{option.name}</button>)}
                </> : <>
                    <button disabled={this.props.disabled} className="selected"
                        onClick={() => this.setState({ selected: null })}>{this.state.options.find((option) => option.id === this.state.selected)?.name ?? "Créer"}</button>
                </>}
            </div>

            {this.state.selected && this.state.selected < 0 && this.props.getForm({ ref: this.formRef, disabled: this.props.disabled, autoFocus: true, onEnter: this.props.onEnter })}

        </>;
    }
}

export const ChoosePersonForm = (props) => <ChooseForm name="Personne" getOptions={getPeople} getForm={(props) => <CreatePersonForm {...props} />} {...props} />;

export const ChooseAccountForm = (props) => <ChooseForm name="Compte" getOptions={getAccounts} getForm={(props) => <CreateAccountForm {...props} />} {...props} />;

export const ChooseBusinessForm = (props) => <ChooseForm name="Entreprise" getOptions={getBusinesses} getForm={(props) => <CreateBusinessForm {...props} />} {...props} />;

export class CreateInflowForm extends Component {

    constructor(props) {

        super(props);

        this.personFormRef = createRef();
        this.accountFormRef = createRef();
        this.fromBusinessFormRef = createRef();
        this.fromNameInputRef = createRef();
        this.amountInputRef = createRef();
        this.descriptionInputRef = createRef();
        this.startDateInputRef = createRef();
        this.endDateInputRef = createRef();
        this.dateInputRef = createRef();

        this.state = { fromBusiness: true };
    }

    async create() {

        const inflow = {};

        inflow.person = await this.personFormRef.current.choose();
        inflow.account = await this.accountFormRef.current.choose();
        if (this.state.fromBusiness) inflow.fromBusiness = await this.fromBusinessFormRef.current.choose();
        else inflow.fromName = this.fromNameInputRef.current.value;
        inflow.amount = parseFloat(this.amountInputRef.current.value.replace(",", "."));
        inflow.description = this.descriptionInputRef.current.value || null;
        inflow.startDate = this.startDateInputRef.current.value ? new Date(this.startDateInputRef.current.value).getTime() : null;
        inflow.endDate = this.endDateInputRef.current.value ? new Date(this.endDateInputRef.current.value).getTime() : null;
        inflow.date = new Date(this.dateInputRef.current.value).getTime();

        if (isNaN(inflow.amount)) throw { info: <Info>Le montant doit être un nombre !</Info>, cb: () => this.amountInputRef.current.focus() };
        if (!this.dateInputRef.current.value) throw { info: <Info>Veuillez choisir une date valide !</Info>, cb: () => this.dateInputRef.current.focus() };

        try {
            return await createInflow(inflow);
        } catch (error) {
            if (error === "From name must be between 2 and 50 characters")
                throw { info: <Info>Le nom de la source doit contenir entre 2 et 50 caractères !</Info>, cb: () => this.fromNameInputRef.current.focus() };
            else if (error === "Description must be between 2 and 100 characters")
                throw { info: <Info>La description doit contenir entre 2 et 100 caractères !</Info>, cb: () => this.descriptionInputRef.current.focus() };
            else
                throw { info: <Info>Un problème est survenu !</Info> };
        }
    }

    render() {
        return <>

            <ChoosePersonForm ref={this.personFormRef} disabled={this.props.disabled} onEnter={() => { }} />

            <ChooseAccountForm ref={this.accountFormRef} disabled={this.props.disabled} onEnter={() => { }} />

            <div className="choose-title">Source</div>
            <div className="choose-list-horizontal">
                <button disabled={this.props.disabled} className={this.state.fromBusiness ? "" : "selected"} onClick={() => this.setState({ fromBusiness: false })}>Nom</button>
                <button disabled={this.props.disabled} className={this.state.fromBusiness ? "selected" : ""} onClick={() => this.setState({ fromBusiness: true })}>Entreprise</button>
            </div>

            {this.state.fromBusiness ? <ChooseBusinessForm ref={this.fromBusinessFormRef} disabled={this.props.disabled} onEnter={() => this.amountInputRef.current.focus()} /> : <>
                <div>Nom</div>
                <input ref={this.fromNameInputRef} disabled={this.props.disabled} autoFocus
                    onKeyDown={(event) => event.key === "Enter" && this.amountInputRef.current.focus()} />
            </>}

            <div>Montant</div>
            <input ref={this.amountInputRef} disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.descriptionInputRef.current.focus()}
                onBlur={(event) => { const parsed = parseFloat(event.target.value.replace(",", ".")); event.target.value = isNaN(parsed) ? "" : parsed.toFixed(2).replace(".", ",") }}
                onInput={(event) => event.target.value = event.target.value.replace(/[^\d.,]/g, "").replace(/\./g, ",").replace(/^([^.]*,)|,/g, "$1")} />

            <div>Description</div>
            <input ref={this.descriptionInputRef} disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.startDateInputRef.current.focus()} />

            <div>Date de début</div>
            <input ref={this.startDateInputRef} type="date" disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.endDateInputRef.current.focus()} />

            <div>Date de fin</div>
            <input ref={this.endDateInputRef} type="date" disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.dateInputRef.current.focus()} />

            <div>Date</div>
            <input ref={this.dateInputRef} type="datetime-local" disabled={this.props.disabled} defaultValue={new Date().toISOString().slice(0, 16)}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter()} />

        </>;
    }
}

export class CreateOutflowForm extends Component {

    constructor(props) {

        super(props);

        this.personFormRef = createRef();
        this.accountFormRef = createRef();
        this.toNameInputRef = createRef();
        this.toBusinessFormRef = createRef();
        this.amountInputRef = createRef();
        this.descriptionInputRef = createRef();
        this.startDateInputRef = createRef();
        this.endDateInputRef = createRef();
        this.dateInputRef = createRef();

        this.state = { toBusiness: true };
    }

    async create() {

        const inflow = {};

        inflow.person = await this.personFormRef.current.choose();
        inflow.account = await this.accountFormRef.current.choose();
        if (this.state.toBusiness) inflow.toBusiness = await this.toBusinessFormRef.current.choose();
        else inflow.toName = this.toNameInputRef.current.value;
        inflow.amount = parseFloat(this.amountInputRef.current.value.replace(",", "."));
        inflow.description = this.descriptionInputRef.current.value || null;
        inflow.startDate = this.startDateInputRef.current.value ? new Date(this.startDateInputRef.current.value).getTime() : null;
        inflow.endDate = this.endDateInputRef.current.value ? new Date(this.endDateInputRef.current.value).getTime() : null;
        inflow.date = new Date(this.dateInputRef.current.value).getTime();

        if (isNaN(inflow.amount)) throw { info: <Info>Le montant doit être un nombre !</Info>, cb: () => this.amountInputRef.current.focus() };
        if (!this.dateInputRef.current.value) throw { info: <Info>Veuillez choisir une date valide !</Info>, cb: () => this.dateInputRef.current.focus() };

        try {
            return await createOutflow(inflow);
        } catch (error) {
            if (error === "To name must be between 2 and 50 characters")
                throw { info: <Info>Le nom de la destination doit contenir entre 2 et 50 caractères !</Info>, cb: () => this.toNameInputRef.current.focus() };
            else if (error === "Description must be between 2 and 100 characters")
                throw { info: <Info>La description doit contenir entre 2 et 100 caractères !</Info>, cb: () => this.descriptionInputRef.current.focus() };
            else
                throw { info: <Info>Un problème est survenu !</Info> };
        }
    }

    render() {
        return <>

            <ChoosePersonForm ref={this.personFormRef} disabled={this.props.disabled} onEnter={() => { }} />

            <ChooseAccountForm ref={this.accountFormRef} disabled={this.props.disabled} onEnter={() => { }} />

            <div className="choose-title">Destination</div>
            <div className="choose-list-horizontal">
                <button disabled={this.props.disabled} className={this.state.toBusiness ? "" : "selected"} onClick={() => this.setState({ toBusiness: false })}>Nom</button>
                <button disabled={this.props.disabled} className={this.state.toBusiness ? "selected" : ""} onClick={() => this.setState({ toBusiness: true })}>Entreprise</button>
            </div>

            {this.state.toBusiness ? <ChooseBusinessForm ref={this.toBusinessFormRef} disabled={this.props.disabled} onEnter={() => this.amountInputRef.current.focus()} /> : <>
                <div>Nom</div>
                <input ref={this.toNameInputRef} disabled={this.props.disabled} autoFocus
                    onKeyDown={(event) => event.key === "Enter" && this.amountInputRef.current.focus()} />
            </>}

            <div>Montant</div>
            <input ref={this.amountInputRef} disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.descriptionInputRef.current.focus()}
                onBlur={(event) => { const parsed = parseFloat(event.target.value.replace(",", ".")); event.target.value = isNaN(parsed) ? "" : parsed.toFixed(2).replace(".", ",") }}
                onInput={(event) => event.target.value = event.target.value.replace(/[^\d.,]/g, "").replace(/\./g, ",").replace(/^([^.]*,)|,/g, "$1")} />

            <div>Description</div>
            <input ref={this.descriptionInputRef} disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.startDateInputRef.current.focus()} />

            <div>Date de début</div>
            <input ref={this.startDateInputRef} type="date" disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.endDateInputRef.current.focus()} />

            <div>Date de fin</div>
            <input ref={this.endDateInputRef} type="date" disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.dateInputRef.current.focus()} />

            <div>Date</div>
            <input ref={this.dateInputRef} type="datetime-local" disabled={this.props.disabled} defaultValue={new Date().toISOString().slice(0, 16)}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter()} />

        </>;
    }
}

export class CreateFlowForm extends Component {

    constructor(props) {

        super(props);

        this.fromAccountFormRef = createRef();
        this.toAccountFormRef = createRef();
        this.amountInputRef = createRef();
        this.dateInputRef = createRef();
    }

    async create() {

        const flow = {};

        flow.fromAccount = await this.fromAccountFormRef.current.choose();
        flow.toAccount = await this.toAccountFormRef.current.choose();
        flow.amount = parseFloat(this.amountInputRef.current.value.replace(",", "."));
        flow.date = new Date(this.dateInputRef.current.value).getTime();

        if (isNaN(flow.amount)) throw { info: <Info>Le montant doit être un nombre !</Info>, cb: () => this.amountInputRef.current.focus() };
        if (!this.dateInputRef.current.value) throw { info: <Info>Veuillez choisir une date valide !</Info>, cb: () => this.dateInputRef.current.focus() };

        try {
            return await createFlow(flow);
        } catch (error) {
            if (error === "From and to accounts must be different")
                throw { info: <Info>Les comptes source et destination doivent être différents !</Info>, cb: () => this.toAccountFormRef.current.choose() };
            else
                throw { info: <Info>Un problème est survenu !</Info> };
        }
    }

    render() {
        return <>

            <ChooseAccountForm ref={this.fromAccountFormRef} name="Compte source" disabled={this.props.disabled} onEnter={() => { }} />

            <ChooseAccountForm ref={this.toAccountFormRef} name="Compte destination" disabled={this.props.disabled} onEnter={() => this.amountInputRef.current.focus()} />

            <div>Montant</div>
            <input ref={this.amountInputRef} disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.dateInputRef.current.focus()}
                onBlur={(event) => { const parsed = parseFloat(event.target.value.replace(",", ".")); event.target.value = isNaN(parsed) ? "" : parsed.toFixed(2).replace(".", ",") }}
                onInput={(event) => event.target.value = event.target.value.replace(/[^\d.,]/g, "").replace(/\./g, ",").replace(/^([^.]*,)|,/g, "$1")} />

            <div>Date</div>
            <input ref={this.dateInputRef} type="datetime-local" disabled={this.props.disabled} defaultValue={new Date().toISOString().slice(0, 16)}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter()} />

        </>;
    }
}
