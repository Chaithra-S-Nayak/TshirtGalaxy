import React, { useEffect, useState } from "react";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import {  useNavigate } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { server } from "../../server";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "./Ratings";
import axios from "axios";

const ProductDetails = ({ data }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { products } = useSelector((state) => state.products);
  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [select, setSelect] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllProductsShop(data && data?.shop._id));
    if (wishlist && wishlist.find((i) => i._id === data?._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [data, wishlist]);

  const incrementCount = () => {
    setCount(count + 1);
  };

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };
  const handleSizeSelection = (size) => {
    setSelectedSize(size); // Update selected size state
  };

  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };

  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);
    if (isItemExists) {
      toast.error("Item already in cart!");
    } else {
      if (data.stock < 1) {
        toast.error("Product stock limited!");
      } else {
        if (!selectedSize) {
          toast.error("Please select a size!");
        } else {
          const cartData = { ...data, qty: count, size: selectedSize };
          dispatch(addTocart(cartData));
          toast.success("Item added to cart successfully!");
        }
      }
    }
  };

  const totalReviewsLength =
    products &&
    products.reduce((acc, product) => acc + product.reviews.length, 0);

  const totalRatings =
    products &&
    products.reduce(
      (acc, product) =>
        acc + product.reviews.reduce((sum, review) => sum + review.rating, 0),
      0
    );

  const avg = totalRatings / totalReviewsLength || 0;

  const averageRating = avg.toFixed(2);

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      const groupTitle = data._id + user._id;
      const userId = user._id;
      const sellerId = data.shop._id;
      await axios
        .post(`${server}/conversation/create-new-conversation`, {
          groupTitle,
          userId,
          sellerId,
        })
        .then((res) => {
          navigate(`/inbox?${res.data.conversation._id}`);
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
    } else {
      toast.error("Please login to create a conversation");
    }
  };

  return (
    <div className="bg-white p-4">
      {data ? (
        <div className="flex flex-col lg:flex-row w-full lg:w-4/5 mx-auto gap-6">
          {/* Left side - Product images */}
          <div className="lg:w-1/2 lg:pr-20">
            <img
              src={data.images[select]?.url}
              alt=""
              className="w-full h-auto"
            />
            <div className="flex gap-2 mt-2">
              {data.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt=""
                  className={`w-20 h-20 object-cover cursor-pointer ${
                    select === index && "border-2 border-gray-500"
                  }`}
                  onClick={() => setSelect(index)}
                />
              ))}
            </div>
          </div>

          {/* Right side - Product details */}
          <div className="lg:w-1/2 space-y-6">
            <div className="p-4 bg-white shadow-md rounded-lg">
              <h1 className="text-2xl font-bold text-gray-800">{data.name}</h1>
              <div className="py-4 flex items-center justify-between">
                <div className="flex items-baseline space-x-2">
                  <h5 className="text-2xl font-semibold text-teal-600">
                    ₹
                    {data.originalPrice === 0
                      ? data.originalPrice
                      : data.discountPrice}
                  </h5>
                  {data.originalPrice !== 0 && (
                    <h4 className="text-xl text-gray-500 line-through">
                      ₹{data.originalPrice}
                    </h4>
                  )}
                </div>
                <span className="font-medium text-lg text-green-500">
                  {data.sold_out} sold
                </span>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-lg font-bold text-yellow-500">
                  {data.rating}★
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {data.ratings} | {data.reviews.length} Reviews
                </span>
              </div>
            </div>
            <div className="mt-4">
              <div className="space-y-2">
                <label className="block text-gray-700">Select Size</label>
                <div className="grid grid-cols-8 gap-2">
                  {data.availableSizes.map((size, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSizeSelection(size)} // Add onClick handler
                      className={`px-2 py-1 border rounded text-gray-700 ${
                        selectedSize === size ? "bg-gray-300" : ""
                      }`} // Add conditional class for selected size
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center mt-4">
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded-l"
                onClick={decrementCount}
              >
                -
              </button>
              <span className="px-4 py-2 bg-gray-200 text-gray-800">
                {count}
              </span>
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded-r"
                onClick={incrementCount}
              >
                +
              </button>
              <button
                className="ml-4"
                onClick={() =>
                  click
                    ? removeFromWishlistHandler(data)
                    : addToWishlistHandler(data)
                }
              >
                {click ? (
                  <AiFillHeart size={30} className="text-red-500" />
                ) : (
                  <AiOutlineHeart size={30} className="text-gray-500" />
                )}
              </button>
            </div>

            <button
              className="mt-4 px-4 py-2 bg-teal-500 text-white rounded w-full"
              onClick={() => addToCartHandler(data._id)}
            >
              Add to Cart
              <AiOutlineShoppingCart className="inline-block ml-2" />
            </button>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Product Details</h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {data.description}
                </p>
                <p className="text-gray-600">
                  The Crepe Fully Stretchable Palazzo by Beera Fashion Hub will
                  add total color and beautiful vibe in your life style. A Cloth
                  must have your wardrobe to make it extremely trendy, stylish
                  and hit a perfect comfortable styling. Style it with tank top,
                  span top, long straight top or kurti to complete the beautiful
                  & elegant look. Our products are with high quality at
                  competitive pricing for 100% customer satisfaction & lots of
                  designs, fit & quality.
                </p>
                <div className="mt-2 text-gray-600">
                  <p>Size:</p>
                  <ul>
                    {[
                      "26 (Waist Size: 26 in, Length Size: 37 in)",
                      "28 (Waist Size: 28 in, Length Size: 37 in)",
                      "30 (Waist Size: 30 in, Length Size: 37 in)",
                      "32 (Waist Size: 32 in, Length Size: 37 in)",
                      "34 (Waist Size: 34 in, Length Size: 37 in)",
                      "36 (Waist Size: 36 in, Length Size: 37 in)",
                      "38 (Waist Size: 38 in, Length Size: 37 in)",
                      "Free Size (Waist Size: 50 in, Length Size: 37 in)",
                    ].map((size, idx) => (
                      <li key={idx}>{size}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold">Seller Information</h2>
                <div className="flex items-center">
                  <img
                    src={data.shop.avatar.url}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <h4 className="font-medium">{data.shop.name}</h4>
                    <p className="text-sm text-gray-500">
                      ({averageRating}/5) Ratings
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-gray-600">{data.shop.description}</p>
                <button
                  className="mt-4 px-4 py-2 bg-teal-500 text-white rounded"
                  onClick={handleMessageSubmit}
                >
                  Contact Seller
                  <AiOutlineMessage className="inline-block ml-2" />
                </button>
              </div>

              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">
                    Product Ratings & Reviews
                  </h2>
                </div>

                <div>
                  {data &&
                    data.reviews.map((item, index) => (
                      <div key={index} className="w-full flex my-4">
                        <img
                          src={`${item.user.avatar?.url}`}
                          alt=""
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="flex items-center mb-1">
                            <h3 className="text-lg font-semibold">
                              {item.user.name}
                            </h3>
                            <span className="ml-2">
                              <Ratings rating={item.rating} />{" "}
                            </span>
                          </div>
                          <p className="text-gray-700">{item.comment}</p>
                        </div>
                      </div>
                    ))}

                  {data && data.reviews.length === 0 && (
                    <div className="mt-4">
                      <h5>No Reviews!</h5>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductDetails;
