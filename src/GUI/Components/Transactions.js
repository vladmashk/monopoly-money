import PropTypes from "prop-types";
import "./Transactions.css";
import {formatMoney} from "../../index.js";

function Transactions(props) {
    return (
        <div className="box">
            <b className="boxTitle">Transaction history</b>
            <table id="transactionsTable">
                <tbody>
                    {[...props.transactions].slice(-15).reverse().map((t, i) =>
                        <tr key={i} className="transaction">
                            <td className="transactionNb">{props.transactions.length - i}.</td>
                            <td>{t.from}</td>
                            <td>paid</td>
                            <td>{t.to}</td>
                            <td className="money">{formatMoney(t.amount)}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

Transactions.propTypes = {
    transactions: PropTypes.arrayOf(PropTypes.shape({
        from: PropTypes.string,
        to: PropTypes.string,
        amount: PropTypes.number
    }))
};

export default Transactions;
