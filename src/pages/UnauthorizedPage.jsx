import { Errors } from "../components";

function UnauthorizedPage() {

  return (
    <Errors 
      status_code={403}
      title='Unauthorized Access'
      message='You do not have permission to view this page.
        Please contact your administrator if you think this is a mistake.'/>
  )
}

export default UnauthorizedPage;
