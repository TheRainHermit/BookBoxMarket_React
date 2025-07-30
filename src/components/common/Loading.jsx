import { CircularProgress, Backdrop } from '@mui/material';

export const Loading = ({ loading }) => (
  <Backdrop
    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
    open={loading}
  >
    <CircularProgress color="inherit" />
  </Backdrop>
);