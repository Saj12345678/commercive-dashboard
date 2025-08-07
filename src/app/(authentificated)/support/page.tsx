import { Typography } from "@mui/material";
import { BiSupport } from "react-icons/bi";
import TicketForm from "./TicketForm";

export default async function Page() {
  return (
    <main className="flex flex-col h-full max-h-full w-full gap-3 border-l-none md:border-l-2 border-t-2 border-[#F4F4F7] rounded-tl-0 md:rounded-tl-[24px] bg-[#FAFAFA] p-4 md:p-8 overflow-auto custom-scrollbar">
      <div className="w-full flex flex-col gap-2 sm:flex-row justify-start sm:justify-between">
        <Typography
          variant="h5"
          fontWeight="bold"
          className="flex items-center gap-3"
          sx={{
            fontSize: {
              xs: "1rem",
              sm: "1.2rem",
              md: "1.5rem",
            },
          }}
        >
          <BiSupport
            style={{
              width: "20px",
              height: "20px",
            }}
            color="rgb(79, 17, 201)"
          />
          Your Quotes
        </Typography>
      </div>
      <TicketForm />
    </main>
  );
}
