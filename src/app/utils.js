import Link from "next/link";

export const Loading = () => <div className="loading">Chargement...</div>;

export const Info = ({ children }) => <div className="info">{children}</div>;

export const LinkedTr = ({ children, href }) => <tr className="linked">
    {(Array.isArray(children) ? children : [children]).map((child, index) => <td key={index}><Link href={href}>{child.props.children}</Link></td>)}
</tr>;
