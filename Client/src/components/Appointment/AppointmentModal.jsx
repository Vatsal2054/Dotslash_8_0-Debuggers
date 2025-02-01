import { useState } from "react";
import { X } from "lucide-react";
import Input from "../UI/Inputs";
import Button from "../UI/Buttons";

const AppointmentModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    type: "in-person",
    notes: "",
    doctorId: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        date: "",
        time: "",
        type: "in-person",
        notes: "",
        doctorId: "",
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">Book Appointment</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            Type="PRIMARY"
            type="date"
            labelText="Date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
          />

          <Input
            Type="PRIMARY"
            type="time"
            labelText="Time"
            value={formData.time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, time: e.target.value }))
            }
          />

          <Input
            Type="PRIMARY"
            type="dropdown"
            labelText="Appointment Type"
            options={["in-person", "online"]}
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value }))
            }
          />

          <Input
            Type="PRIMARY"
            type="dropdown"
            labelText="Select Doctor"
            options={
              formData.type === "online"
                ? ["Dr. Smith (Online)", "Dr. Johnson (Online)"]
                : ["Dr. Brown (Clinic)", "Dr. Davis (Clinic)"]
            }
            value={formData.doctorId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, doctorId: e.target.value }))
            }
          />

          <Input
            Type="PRIMARY"
            type="text"
            labelText="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
          />

          <div className="flex gap-4 pt-4">
            <Button type="SECONDARY" extraClasses="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="PRIMARY" extraClasses="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
