import { Errors, Container } from "../components";

function UnauthorizedPage() {

  return (
    <Container>
      <Errors 
      status_code={403}
      title='Unauthorized Access'
      message='You do not have permission to view this page.
        Please contact your administrator if you think this is a mistake.'/>
    </Container>
    
  )
}

export default UnauthorizedPage;
