import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionTable = ({ selectedMonth }) => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, search, page]);

  const fetchTransactions = async () => {
    const { data } = await axios.get(`/api/transactions`, {
      params: { month: selectedMonth, search, page },
    });
    setTransactions(data.transactions);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search transactions..."
        value={search}
        onChange={handleSearch}
      />
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Sold</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{transaction.sold ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
};

export default TransactionTable;
