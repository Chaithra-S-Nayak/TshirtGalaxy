import React, { useState, useEffect } from "react";
import styles from "../../styles/styles";
import { Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const Checkout = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [userInfo, setUserInfo] = useState(false);
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [zipCode, setZipCode] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponCodeData, setCouponCodeData] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const paymentSubmit = () => {
    if (
      address1 === "" ||
      address2 === "" ||
      zipCode === null ||
      country === "" ||
      city === ""
    ) {
      toast.error("Please choose your delivery address!");
    } else {
      const shippingAddress = {
        address1,
        address2,
        zipCode,
        country,
        city,
      };

      const latestOrder = JSON.parse(localStorage.getItem("latestOrder")) || {};

      const updatedOrderData = {
        ...latestOrder,
        totalPrice,
        couponDiscount,
        shippingAddress,
        user,
      };

      // update local storage with the updated orders array
      localStorage.setItem("latestOrder", JSON.stringify(updatedOrderData));
      navigate("/payment");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = couponCode;

    await axios.get(`${server}/coupon/get-coupon-value/${name}`).then((res) => {
      const shopId = res.data.couponCode?.shopId;
      const couponCodeValue = res.data.couponCode?.value;
      if (res.data.couponCode !== null) {
        const isCouponValid =
          cart && cart.filter((item) => item.shopId === shopId);

        if (isCouponValid.length === 0) {
          toast.error("Coupon code is not valid for this shop");
          setCouponCode("");
        } else {
          const eligiblePrice = isCouponValid.reduce(
            (acc, item) => acc + item.qty * item.discountPrice,
            0
          );
          const couponDiscount = (eligiblePrice * couponCodeValue) / 100;
          setCouponDiscount(couponDiscount.toFixed(2));
          setCouponCodeData(res.data.couponCode);
          setCouponCode("");
          toast.success("Coupon code applied successfully!");
        }
      } else {
        toast.error("Coupon code doesn't exist!");
        setCouponCode("");
      }
    });
  };

  const latestOrder = JSON.parse(localStorage.getItem("latestOrder")) || {};
  const subTotalPrice = (parseFloat(latestOrder.totalProductPrice) || 0).toFixed(2);
  const shipping = (parseFloat(latestOrder.totalDeliveryFee) || 0).toFixed(2);
  const gstAmount = (parseFloat(latestOrder.gstAmount) || 0).toFixed(2);
  const overallProductDiscount = (parseFloat(latestOrder.OverallProductDiscount) || 0).toFixed(2);
  const OverallProductPrice = (parseFloat(latestOrder.OverallProductPrice) || 0).toFixed(2);
  const totalPrice = ((OverallProductPrice - couponDiscount).toFixed(2));

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
        <div className="w-full 800px:w-[65%]">
          <ShippingInfo
            user={user}
            country={country}
            setCountry={setCountry}
            city={city}
            setCity={setCity}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            address1={address1}
            setAddress1={setAddress1}
            address2={address2}
            setAddress2={setAddress2}
            zipCode={zipCode}
            setZipCode={setZipCode}
          />
        </div>
        <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <CartData
            handleSubmit={handleSubmit}
            totalPrice={totalPrice}
            shipping={shipping}
            subTotalPrice={subTotalPrice}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            gstAmount={gstAmount}
            OverallProductPrice={OverallProductPrice}
            couponDiscount={couponDiscount}
            cartLength={cart.length}
            overallProductDiscount={overallProductDiscount}
            paymentSubmit={paymentSubmit}
          />
        </div>
      </div>
    </div>
  );
};
const ShippingInfo = ({
  user,
  country,
  setCountry,
  city,
  setCity,
  userInfo,
  setUserInfo,
  address1,
  setAddress1,
  address2,
  setAddress2,
  zipCode,
  setZipCode,
}) => {
  return (
    <div className="w-full 800px:w-[95%] bg-white rounded-md p-5 pb-8">
      <h5 className="text-[18px] font-[500]">Shipping Address</h5>
      <br />
      <form>
        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Full Name</label>
            <input
              type="text"
              value={user && user.name}
              required
              className={`${styles.input} !w-[95%]`}
            />
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">Email Address</label>
            <input
              type="email"
              value={user && user.email}
              required
              className={`${styles.input}`}
            />
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Phone Number</label>
            <input
              type="number"
              required
              value={user && user.phoneNumber}
              className={`${styles.input} !w-[95%]`}
            />
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">Zip Code</label>
            <input
              type="number"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
              className={`${styles.input}`}
            />
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Country</label>
            <select
              className="w-[95%] border h-[40px] rounded-[5px]"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option className="block pb-2" value="">
                Choose your country
              </option>
              {Country &&
                Country.getAllCountries().map((item) => (
                  <option key={item.isoCode} value={item.isoCode}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">City</label>
            <select
              className="w-[95%] border h-[40px] rounded-[5px]"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option className="block pb-2" value="">
                Choose your City
              </option>
              {State &&
                State.getStatesOfCountry(country).map((item) => (
                  <option key={item.isoCode} value={item.isoCode}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Address1</label>
            <input
              type="address"
              required
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className={`${styles.input} !w-[95%]`}
            />
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">Address2</label>
            <input
              type="address"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              required
              className={`${styles.input}`}
            />
          </div>
        </div>

        <div></div>
      </form>
      <h5
        className="text-[18px] cursor-pointer inline-block"
        onClick={() => setUserInfo(!userInfo)}
      >
        Choose From saved address
      </h5>
      {userInfo && (
        <div>
          {user &&
            user.addresses.map((item, index) => (
              <div className="w-full flex mt-1" key={index}>
                <input
                  type="checkbox"
                  className="mr-3"
                  value={item.addressType}
                  onClick={() =>
                    setAddress1(item.address1) ||
                    setAddress2(item.address2) ||
                    setZipCode(item.zipCode) ||
                    setCountry(item.country) ||
                    setCity(item.city)
                  }
                />
                <h2>{item.addressType}</h2>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

const CartData = ({
  handleSubmit,
  totalPrice,
  shipping,
  subTotalPrice,
  couponCode,
  setCouponCode,
  gstAmount,
  OverallProductPrice,
  couponDiscount,
  cartLength,
  overallProductDiscount,
  paymentSubmit, 
}) => {
  return (
    <div className="w-full bg-white rounded-md p-5 pb-8">
      <div className="flex justify-between">
        <h5 className="text-[18px] font-[500]">
          Price Details ({cartLength} Items)
        </h5>
      </div>
      <br />
      <div>
        <div className="flex justify-between mb-2">
          <p>Total Product Price</p>
          <p>₹{subTotalPrice}</p>
        </div>
        <div className="flex justify-between mb-2">
          <p>Overall Product Discount</p>
          <p>-₹{overallProductDiscount}</p>
        </div>

        <div className="flex justify-between mb-2">
          <p>Total Delivery Fee</p>
          <p>₹{shipping}</p>
        </div>
        <div className="flex justify-between mb-2">
          <p>GST</p>
          <p>₹{gstAmount}</p>
        </div>
        <div className="flex justify-between mb-2">
          <p>Overall Product Price</p>
          <p>₹{OverallProductPrice}</p>
        </div>
        <div className="flex justify-between mb-2 border-t pt-4 mt-4">
          <p>Coupon-Induced Discount</p>
          <p>-₹{couponDiscount}</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="w-full px-4 py-2 border rounded-l-lg"
              required
            />
            <button
              type="submit"
              className="bg-[#243450] text-white px-4 py-2 rounded-r-lg"
            >
              Apply
            </button>
          </div>
        </form>
        <div className="flex justify-between font-bold border-t pt-4 mt-4">
          <p>Order Total</p>
          <p>₹{totalPrice}</p>
        </div>
        
       
          <button onClick={paymentSubmit} className="mt-6 w-full bg-[#243450] text-white py-2 rounded">
          Go to Payment
          </button>
       
      </div>
    </div>
  );
};

export default Checkout;
