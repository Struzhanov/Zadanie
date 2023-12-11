import { useState, useEffect } from "react";
import Modal from "./Modal";
import "./App.css";

type Product = {
  id: number;
  title: string;
  price: number;
  data: string;
};

const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/posts");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts([...products, newProduct]);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const renderTableHeader = () => {
    return (
      <tr>
        <th>#</th>
        <th>Title</th>
        <th>Price, USD</th>
        <th>Date and time</th>
      </tr>
    );
  };

  const renderTableData = () => {
    const sortedProducts = products.slice().sort((a, b) => {
      const dateA = new Date(a.data).getTime();
      const dateB = new Date(b.data).getTime();
      return dateA - dateB;
    });

    return sortedProducts.map((product, index) => {
      const { title, price, data } = product;
      return (
        <tr key={index + 1}>
          <td>{index + 1}</td>
          <td>{title}</td>
          <td>{price}</td>
          <td>{data}</td>
        </tr>
      );
    });
  };

  return (
    <>
      <div className="appContainer">
        <h1 className="leftTitle">Stock center</h1>
        <div className="centerTitle">
          <h1>Items in stock</h1>
        </div>
        <div
          className={`menuIcon ${menuOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </div>
        <div className={`menu ${menuOpen ? "show" : ""}`}>
          <ul>
            <li>Menu Item 1</li>
            <li>Menu Item 2</li>
            <li>Menu Item 3</li>
          </ul>
        </div>
      </div>
      <div className="appButton">
        <button className="button" onClick={openModal}>
          New Item
        </button>
        <table className="data-table">
          <thead>{renderTableHeader()}</thead>
          <tbody>{renderTableData()}</tbody>
        </table>
        {showModal && (
          <Modal handleClose={closeModal} handleAddProduct={handleAddProduct} />
        )}
      </div>
    </>
  );
};

export default App;
