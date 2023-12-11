import React, { useState, useEffect } from "react";
import "./Modal.css";

type Props = {
  handleClose: () => void;
  handleAddProduct: (newProduct: Product) => void;
};

type Product = {
  id: number;
  title: string;
  price: number;
  data: string;
};

type Validation = Record<string, boolean>;

const Modal = ({ handleClose, handleAddProduct }: Props) => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    dateTime: "",
  });

  const [validation, setValidation] = useState<Validation>({
    title: true,
    price: true,
    dateTime: true,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isTitleValid = formData.title.trim().length > 0;
    const isPriceValid = /^\d+\.\d{2}$/.test(formData.price);
    const isDateTimeValid = /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/.test(
      formData.dateTime
    );

    setValidation({
      title: isTitleValid,
      price: isPriceValid,
      dateTime: isDateTimeValid,
    });

    if (isTitleValid && isPriceValid && isDateTimeValid) {
      try {
        const response = await fetch("http://localhost:3001/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          console.log("Data saved successfully");
          handleClose();

          const newProduct: Product = await response.json();
          handleAddProduct(newProduct);
        } else {
          console.error("Failed to save data");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const getInputStyle = (inputName: keyof Validation) => {
    return validation[inputName] ? {} : { borderColor: "red" };
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="header">
          <h2>New Item</h2>
          <button className="close-button" onClick={handleClose}>
            &#10006;
          </button>
        </div>
        <hr className="separator1" />
        <form onSubmit={handleSubmit}>
          <div className="title">
            <label htmlFor="titleInput">Title</label>
            <br />
            <input
              id="input1"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Название"
              style={getInputStyle("title")}
            />
            {!validation.title && (
              <div className="error-message">Invalid title</div>
            )}
          </div>
          <div className="price">
            <label htmlFor="priceInput">Price</label>
            <br />
            <input
              id="input2"
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Цена"
              style={getInputStyle("price")}
            />
            {!validation.price && (
              <div className="error-message">Invalid price</div>
            )}
          </div>
          <div className="dataAndTime">
            <label htmlFor="dataAndTime">Date and time</label>
            <br />
            <input
              id="input3"
              type="text"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              placeholder="Дата и время в формате дд.мм.гггг чч:мм:сс"
              style={getInputStyle("dateTime")}
            />
            {!validation.dateTime && (
              <div className="error-message">Invalid date time</div>
            )}
          </div>
          <hr className="separator2" />
          <div className="twoButton">
            <button className="button1" onClick={handleClose}>
              Close
            </button>
            <button className="button2" type="submit">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
