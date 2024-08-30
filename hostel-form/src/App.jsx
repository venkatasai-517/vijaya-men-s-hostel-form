import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import firebaseDB from "./firebase.jsx";
import { v4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { imgDB } from "./firebase.jsx"; // Ensure this import is correct

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [data1, setData1] = useState({
    date: "",
    name: "",
    adhar_num: "",
    mobile_num: "",
    status: "",
    room_number: "",
    floor_number: "",
    price: "",
    Tenant_img: "",
    due_date: "",
  });
  const [img, setImg] = useState(null);
  const [error, setError] = useState({
    adhar: "",
    mobile: "",
  });
  const [rooms, setRooms] = useState({});

  const aadhaarPattern = /^\d{12}$/;
  const mobilePattern = /^[6-9]\d{9}$/;

  useEffect(() => {
    const fetchData = async () => {
      const roomData = {};
      const roomCategories = [
        "G1",
        "G2",
        "A1",
        "A2",
        "A3",
        "A4",
        "A5",
        "A6",
        "A7",
        "B1",
        "B2",
        "B3",
        "B4",
        "B5",
        "B6",
        "C1",
        "C2",
        "C3",
        "C4",
      ];

      for (const category of roomCategories) {
        const snapshot = await firebaseDB.child(category).once("value");
        const data = snapshot.val();
        if (data) {
          roomData[category] = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
        } else {
          roomData[category] = [];
        }
      }

      setRooms(roomData);
    };

    fetchData();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    const imgRef = ref(imgDB, `file/${v4()}`);
    await uploadBytes(imgRef, file);
    const url = await getDownloadURL(imgRef);
    return url;
  };
  const LoadingModal = ({ isOpen, isSuccess }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          {isSuccess ? (
            <>
              <svg
                className="h-10 w-10 text-green-500 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-center text-lg font-semibold text-gray-700">
                Data saved successfully!
              </p>
            </>
          ) : (
            <>
              <svg
                className="animate-spin h-10 w-10 text-blue-600 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              <p className="text-center text-lg font-semibold text-gray-700">
                Processing...
              </p>
            </>
          )}
        </div>
      </div>
    );
  };

  const roomDetails = {
    G1: { capacity: 6, price: 4800, floor: "Ground" },
    G2: { capacity: 6, price: 4800, floor: "Ground" },
    A1: { capacity: 6, price: 4800, floor: "First" },
    A2: { capacity: 6, price: 4800, floor: "First" },
    A3: { capacity: 2, price: 4800, floor: "First" },
    A4: { capacity: 5, price: 4800, floor: "First" },
    A5: { capacity: 3, price: 5100, floor: "First" },
    A6: { capacity: 1, price: 5100, floor: "First" },
    A7: { capacity: 2, price: 4800, floor: "First" },
    B1: { capacity: 6, price: 4800, floor: "Second" },
    B2: { capacity: 6, price: 4800, floor: "Second" },
    B3: { capacity: 3, price: 5100, floor: "Second" },
    B4: { capacity: 4, price: 5000, floor: "Second" },
    B5: { capacity: 6, price: 4800, floor: "Second" },
    B6: { capacity: 1, price: 5100, floor: "Second" },
    C1: { capacity: 1, price: 5100, floor: "Thrid" },
    C2: { capacity: 1, price: 5100, floor: "Thrid" },
    C3: { capacity: 1, price: 5100, floor: "Thrid" },
    C4: { capacity: 1, price: 5100, floor: "Thrid" },
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading animation
    // Validate Aadhaar Number
    if (data1.adhar_num.trim() === "") {
      setError({ ...error, adhar: "Enter Aadhaar Number" });
      return;
    } else if (!aadhaarPattern.test(data1.adhar_num)) {
      setError({ ...error, adhar: "Enter valid Aadhaar Number" });
      return;
    } else {
      setError({ ...error, adhar: "" });
    }

    // Validate Mobile Number
    if (data1.mobile_num.trim() === "") {
      setError({ ...error, mobile: "Enter Mobile Number" });
      return;
    } else if (!mobilePattern.test(data1.mobile_num)) {
      setError({ ...error, mobile: "Enter valid Mobile Number" });
      return;
    } else {
      setError({ ...error, mobile: "" });
    }

    const room_number = data1.room_number;
    const roomCapacity = roomDetails[room_number]?.capacity || 6;

    const snapshot = await firebaseDB.child(room_number).get();
    if (
      snapshot.exists() &&
      Object.keys(snapshot.val()).length >= roomCapacity
    ) {
      alert(`You cannot add more than ${roomCapacity} records in this room.`);
      return;
    }

    const formKey = `${data1.adhar_num}-${data1.mobile_num}`;
    const formExists = Cookies.get(formKey);

    if (formExists) {
      alert("You have already submitted this form.");
      return;
    }

    try {
      const url = await handleFileUpload(img);
      const formDataWithImgUrl = { ...data1, student_img: url };
      await firebaseDB.child(room_number).push(formDataWithImgUrl);

      Cookies.set(formKey, true, { expires: 30 });

      setIsSuccess(true); // Set success state to true
      setData1({
        date: "",
        name: "",
        adhar_num: "",
        mobile_num: "",
        status: "",
        room_number: "",
        floor_number: "",
        price: "",
        student_img: "",
      });
      setImg(null);

      setTimeout(() => {
        setIsLoading(false); // Hide modal after a short delay
      }, 2000); // Adjust the time as needed
    } catch (error) {
      console.error("Error saving data:", error);
      setIsLoading(false); // Hide loading modal on error
    }
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;

    if (name === "date") {
      setData1({
        ...data1,
        [name]: value,
        due_date: calculateDueDate(value),
      });
    } else if (name === "room_number") {
      const selectedRoom = roomDetails[value] || {};
      setData1({
        ...data1,
        [name]: value,
        price: selectedRoom.price || "",
        floor_number: selectedRoom.floor || "",
      });
    } else {
      setData1({ ...data1, [name]: value });
    }
  };

  const calculateDueDate = (dateOfJoin) => {
    const dueDate = new Date(dateOfJoin);
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate.toISOString().split("T")[0];
  };

  return (
    <div className="container mt-3 max-w-lg mx-auto p-4 bg-white rounded-lg shadow-lg">
      <form onSubmit={submitHandler}>
        <h1 className="text-3xl text-center font-semibold mb-4">
          Vijaya Men's Hostel
        </h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Joining Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              name="date"
              value={data1.date}
              onChange={changeHandler}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tenant Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              name="name"
              placeholder="Enter Your Name"
              value={data1.name}
              onChange={changeHandler}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Aadhaar Number
            </label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              name="adhar_num"
              placeholder="Enter Your Aadhaar Number"
              value={data1.adhar_num}
              onChange={changeHandler}
              required
            />
            {error.adhar && (
              <p className="text-red-500 text-sm mt-1">{error.adhar}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              name="mobile_num"
              placeholder="Enter Your Mobile Number"
              value={data1.mobile_num}
              onChange={changeHandler}
              required
            />
            {error.mobile && (
              <p className="text-red-500 text-sm mt-1">{error.mobile}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tenant Status
            </label>
            <select
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              name="status"
              value={data1.status}
              onChange={changeHandler}
              required
            >
              <option value="" disabled>
                Choose...
              </option>
              <option value="Joined">Joined</option>
              <option value="Vacated">Vacated</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Room Number
            </label>
            <select
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              name="room_number"
              value={data1.room_number}
              onChange={changeHandler}
              required
            >
              <option value="" disabled>
                Select Room
              </option>
              {Object.keys(roomDetails).map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Floor Number
            </label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              name="floor_number"
              value={data1.floor_number}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              name="price"
              value={data1.price}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tenant Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500"
              name="Tenant_img"
              required
              onChange={(e) => setImg(e.target.files[0])}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              name="due_date"
              value={data1.due_date}
              readOnly
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </form>
      <LoadingModal isOpen={isLoading} isSuccess={isSuccess} />
    </div>
  );
}

export default App;
