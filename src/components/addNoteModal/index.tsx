import { toast } from "react-toastify";
import Modal from "~/common/Modal";
import FormComponent from "~/common/form";
import { addNoteForm } from "~/utils/constants";
export default function AddNoteModal(props: any) {
  return (
    <Modal
      title={"Add Notes"}
      onCloseClick={() => {
        props.setNote("");
        props.setOpen(false);
      }}
      onSaveClick={() => {
        if (props.note?.title && props.note.description) {
          props.setOpen(false);
          props.handleSubmit(props.note?.title, props.note.description);
        } else {
          toast.info("Add title and description ", {
            toastId: "fetchError",
            autoClose: 2000,
          });
        }
      }}
      showButtons
      border
    >
      <div>
        <FormComponent
          inputs={addNoteForm}
          formValues={props.note}
          handleChange={props.handleNoteChange}
          formErrors={() => {}}
        />
      </div>
    </Modal>
  );
}
