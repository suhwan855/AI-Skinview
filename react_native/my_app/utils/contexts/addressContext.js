// AddressContext.js
import React, { createContext, useState } from "react";

// 1. Context 생성
export const AddressContext = createContext();

// 2. Provider 컴포넌트 정의
const AddressProvider = ({ children }) => {
  const [address, _setAddress] = useState({
    postalCode: "",
    address1: "",
    address2: "",
  });

  const setAddress = (newAddress) => {
    console.log("💾 setAddress() 호출");
    console.log("📦 새 주소 값:", newAddress);
    _setAddress(newAddress);
  };

  const updateAddress = (key, value) => {
    console.log(`🔧 updateAddress() 호출: ${key} → ${value}`);
    setAddress((prevState) => {
      const updated = { ...prevState, [key]: value };
      console.log("🧠 업데이트된 주소 상태:", updated);
      return updated;
    });
  };

  return (
    <AddressContext.Provider value={{ address, updateAddress, setAddress }}>
      {children}
    </AddressContext.Provider>
  );
};

export default AddressProvider;