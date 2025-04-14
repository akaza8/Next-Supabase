"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { myAppHook } from "@/context/AppUtils";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { set } from "react-hook-form";
import { Formik } from "formik";
import { date, mixed, number, object, string } from "yup";

const Dashboard = () => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [products, setProducts] = useState<
    | null
    | {
        id: number;
        title: string;
        content: string;
        cost: number;
        bannerImage: string;
        created_at: string;
        user_id: number;
        image_url: string | null;
      }[]
  >(null);
  const [editingProduct, setEditingProduct] = useState<null | {
    id: number;
    title: string;
    content: string;
    cost: number;
    image_url: string | null;
  }>(null);
  const { isLoogedIn } = myAppHook();
  useEffect(() => {
    if (localStorage.getItem("loginSuccess") === "true") {
      toast.success("Login Successful!");
      localStorage.removeItem("loginSuccess");
    }
  }, []);
  async function fetchProduct() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id);
      if (error) {
        console.error("Error fetching products:", error);
        return [];
      }
      const productsWithImages = data.map((product) => ({
        ...product,
        image_url: product.image_url
          ? supabase.storage
              .from("banner-image")
              .getPublicUrl(product.image_url).data.publicUrl
          : null,
      }));

      return productsWithImages;
    }
  }
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetchProduct().then((pds) => {
      if (pds !== undefined && pds.length > 0) {
        setProducts(pds);
      } else {
        setProducts(null);
      }
      setLoading(false);
    });
  }, []);
  let productSchema = object({
    title: string().required(),
    content: string()
      .min(10, "Description must be at least 10 characters lon")
      .required(),
    cost: number().required(),
    bannerImage: mixed().required("File is required"),
    created_at: date().default(() => new Date()),
  });
  const hasProducts = products && products.length > 0;
  const handleDelete = async (productId: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        // Delete from database
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", productId);

        if (error) throw error;

        // Delete image from storage if exists
        const productToDelete = products?.find((p) => p.id === productId);
        if (productToDelete?.image_url) {
          const imagePath = productToDelete.image_url.split("/").pop();
          await supabase.storage
            .from("banner-image")
            .remove([`images/${imagePath}`]);
        }

        // Update UI
        setProducts(
          products?.filter((product) => product.id !== productId) || null
        );
        toast.success("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };
  const handleEdit = (product: any) => {
    setEditingProduct(product);
    if (product.image_url) {
      let imageUrl = product.image_url;
      if (!imageUrl.startsWith("http")) {
        const {
          data: { publicUrl },
        } = supabase.storage
          .from("banner-image")
          .getPublicUrl(product.image_url);
        imageUrl = publicUrl;
      }

      setPreviewImage(imageUrl);
    } else {
      setPreviewImage(null);
    }
    document
      .getElementById("product-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  const handleUpdate = async (values: any) => {
    try {
      let imageUrl = editingProduct?.image_url || null;
      const { bannerImage, ...rest } = values;
      // Handle new image upload if provided
      if (bannerImage && (bannerImage as any) instanceof File) {
        // First delete old image if exists
        if (editingProduct?.image_url) {
          const imagePath = editingProduct.image_url.split("/").pop();
          await supabase.storage
            .from("banner-image")
            .remove([`images/${imagePath}`]);
        }

        // Upload new image
        const { data } = await supabase.storage
          .from("banner-image")
          .upload(`images/${Date.now()}.jpg`, bannerImage, {
            contentType: (bannerImage as File).type,
          });

        if (data) imageUrl = data.path;
        else throw new Error("data not found");
        const { error } = await supabase
          .from("products")
          .update({
            ...rest,
            image_url: imageUrl,
          })
          .eq("id", editingProduct?.id);

        if (error) throw error;
        const updatedProducts = await fetchProduct();
        setProducts(
          updatedProducts && updatedProducts.length > 0 ? updatedProducts : null
        );
        const fileInput = document.querySelector(
          'input[name="bannerImage"]'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        setEditingProduct(null);
        setPreviewImage(null);
        toast.success("Product updated successfully");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };
  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-5">
            <h3>{editingProduct ? "Update Product" : "Add Product"}</h3>
            <Formik
              initialValues={{
                title: editingProduct?.title ?? "",
                content: editingProduct?.content ?? "",
                cost: editingProduct?.cost ?? 0,
                bannerImage: null,
              }}
              validationSchema={productSchema}
              onSubmit={
                editingProduct
                  ? handleUpdate
                  : async (values, { setSubmitting, resetForm }) => {
                      try {
                        let imageUrl = "";
                        const { bannerImage, ...rest } = values;
                        if (
                          bannerImage &&
                          (bannerImage as any) instanceof File
                        ) {
                          const { data, error } = await supabase.storage
                            .from("banner-image")
                            .upload(`images/${Date.now()}.jpg`, bannerImage, {
                              contentType: (bannerImage as File).type,
                            });
                          if (error) throw error;
                          imageUrl = data.path;
                        }
                        await supabase.from("products").insert({
                          ...rest,
                          image_url: imageUrl,
                        });
                        fetchProduct().then((pds) => {
                          if (pds !== undefined && pds.length > 0) {
                            setProducts(pds);
                          } else {
                            setProducts(null);
                          }
                        });
                        resetForm();
                        setPreviewImage(null);
                        toast.success("Product added successfully");
                        setSubmitting(false);
                      } catch (error) {
                        toast.error("Failed to save product");
                      }
                    }
              }
              enableReinitialize
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit} id="product-form">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="title">
                      Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.title}
                    />
                    {touched.title && errors.title && (
                      <small className="text-danger">{errors.title}</small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="content">
                      Content
                    </label>
                    <textarea
                      className="form-control"
                      name="content"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.content}
                    ></textarea>
                    {touched.content && errors.content && (
                      <small className="text-danger">{errors.content}</small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="cost">
                      Cost
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="cost"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.cost}
                    />
                    {touched.cost && errors.cost && (
                      <small className="text-danger">{errors.cost}</small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="bannerImage">
                      Banner Image
                    </label>
                    <div className="mb-2">
                      {previewImage && (
                        <img
                          src={previewImage}
                          alt="Preview"
                          id="bannerPreview"
                          width="100"
                          height="100"
                        />
                      )}
                    </div>
                    <input
                      type="file"
                      className="form-control"
                      name="bannerImage"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleChange({
                            target: {
                              name: "bannerImage",
                              value: file,
                            },
                          });
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPreviewImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      onBlur={handleBlur}
                      // value={values.bannerImage}
                    />
                    {touched.bannerImage && errors.bannerImage && (
                      <small className="text-danger">
                        {errors.bannerImage}
                      </small>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? editingProduct
                        ? "Updating..."
                        : "Adding..."
                      : editingProduct
                      ? "Update Product"
                      : "Add Product"}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 mt-2"
                      onClick={() => {
                        setEditingProduct(null);
                        setPreviewImage(null);
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </form>
              )}
            </Formik>
          </div>

          <div className="col-md-7">
            <h3>Product List</h3>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Content</th>
                  <th>Cost</th>
                  <th>Banner Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : hasProducts ? (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.title}</td>
                      <td>{product.content}</td>
                      <td>{product.cost}</td>
                      <td>
                        <img
                          src={product.image_url ? product.image_url : ""}
                          alt={product.title}
                          width="50"
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEdit(product)}
                          disabled={!!editingProduct}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ marginLeft: "10px" }}
                          onClick={() => handleDelete(product.id)}
                          disabled={editingProduct?.id === product.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      {products === null
                        ? "No products found."
                        : "Error loading products."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
