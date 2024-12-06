import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import register from "../assets/register.jpeg";
import Swal from "sweetalert2";
import "@fortawesome/fontawesome-free/css/all.css";

function Registerpage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible((prevState) => !prevState);
  };

 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formErrors = {};

    // Client-side validation
    if (password !== password2) {
      formErrors.password2 = "Passwords do not match.";
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
          password2,
          age_range: ageRange,
          phone,
          location,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Registration Successful",
          icon: "success",
          toast: true,
          timer: 6000,
          position: "bottom-right",
          timerProgressBar: true,
          showConfirmButton: false,
        });
        navigate("/login");
      } else {
        let serverErrors = {};
        if (data.email) serverErrors.email = data.email[0];
        if (data.username) serverErrors.username = data.username[0];
        if (data.password) {
          serverErrors.password =
            data.password[0].toLowerCase().includes("weak")
              ? "Your password is too weak."
              : data.password[0];
        }
        if (data.non_field_errors)
          serverErrors.non_field_errors = data.non_field_errors[0];

        setErrors(serverErrors);
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <div>
      <section className="vh-100" style={{ backgroundColor: "#9A616D" }}>
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col col-xl-10">
              <div className="card" style={{ borderRadius: "1rem" }}>
                <div className="row g-0">
                  <div className="col-md-6 col-lg-5 d-none d-md-block">
                    <img
                      src={register}
                      alt="register form"
                      className="img-fluid"
                      style={{ borderRadius: "1rem 0 0 1rem" }}
                    />
                  </div>
                  <div className="col-md-6 col-lg-7 d-flex align-items-center">
                    <div className="card-body p-4 p-lg-5 text-black">
                      <form onSubmit={handleSubmit}>
                        <div className="d-flex align-items-center mb-3 pb-1">
                          
                          <span className="h2 fw-bold mb-0">
                            Welcome to <b>MSTC👋</b>
                          </span>
                        </div>
                        

                        <div className="form-outline mb-4">
                          <input
                            type="email"
                            className="form-control form-control-lg"
                            placeholder="Email Address"
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          {errors.email && (
                            <span className="text-danger">{errors.email}</span>
                          )}
                        </div>

                        <div className="form-outline mb-4">
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Username"
                            required
                            onChange={(e) => setUsername(e.target.value)}
                          />
                          {errors.username && (
                            <span className="text-danger">{errors.username}</span>
                          )}
                        </div>

                        <div className="form-outline mb-4">
                          <div className="input-group">
                            <input
                              type={passwordVisible ? "text" : "password"}
                              className="form-control form-control-lg"
                              placeholder="Password"
                              required
                              onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={togglePasswordVisibility}
                            >
                              <i
                                className={`fas ${
                                  passwordVisible ? "fa-eye-slash" : "fa-eye"
                                }`}
                              />
                            </button>
                          </div>
                          {errors.password && (
                            <span className="text-danger">{errors.password}</span>
                          )}
                        </div>

                        <div className="form-outline mb-4">
                          <div className="input-group">
                            <input
                              type={confirmPasswordVisible ? "text" : "password"}
                              className="form-control form-control-lg"
                              placeholder="Confirm Password"
                              required
                              onChange={(e) => setPassword2(e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={toggleConfirmPasswordVisibility}
                            >
                              <i
                                className={`fas ${
                                  confirmPasswordVisible ? "fa-eye-slash" : "fa-eye"
                                }`}
                              />
                            </button>
                          </div>
                          {errors.password2 && (
                            <span className="text-danger">{errors.password2}</span>
                          )}
                        </div>

                        <div className="form-outline mb-4">
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Age Range"
                            required
                            onChange={(e) => setAgeRange(e.target.value)}
                          />
                        </div>

                        <div className="form-outline mb-4">
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Phone"
                            required
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>

                        <div className="form-outline mb-4">
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Location"
                            required
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        </div>

                        <div className="pt-1 mb-4">
                          <button className="btn btn-dark btn-lg btn-block" type="submit">
                            Register
                          </button>
                        </div>

                        <p className="mb-5 pb-lg-2" style={{ color: "#393f81" }}>
                          Already have an account?{" "}
                          <Link to="/login" style={{ color: "#393f81" }}>
                            Login Now
                          </Link>
                        </p>
                        <a href="#!" className="small text-muted">
                          Terms of use.
                        </a>
                        <a href="#!" className="small text-muted">
                          Privacy policy
                        </a>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Registerpage;
