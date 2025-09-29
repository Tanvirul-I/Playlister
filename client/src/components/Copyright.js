import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export default function Copyright(props) {
  return (
    <Typography variant="body2" color="white" align="center" {...props}>
      {"Copyright © "}
      <Link color="inherit" href="/">
        Tanvirul Islam
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
