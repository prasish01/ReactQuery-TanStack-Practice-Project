import { Link, useNavigate, useParams } from "react-router-dom";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";

import ErrorBlock from "../UI/ErrorBlock.jsx";
export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["events", params.id] });
      const prevEventData = queryClient.getQueryData(["events", params.id]);
      queryClient.setQueryData(["events", params.id], data.event);
      return { prevEventData };
    },
    onError: (context) => {
      queryClient.setQueryData(["events", params.id], context.prevEventData);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["events", params.id]);
    },
  });
  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }
  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            "Failed to load event. Please try again laters"
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
// export function loader({ params }) {
//   return queryClient.fetchQuery({
//     queryKey: ["events", params.id],
//     queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
//   });
// }

// export async function action({ request, params }) {
//   const formData = await request.formData();
//   const updatedEventData = Object.fromEntries(formData);
//   await updateEvent({ id: params.id, event: updateEventData });
//   queryClient.invalidateQueries();
//   ....
// }
