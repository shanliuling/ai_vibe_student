interface props {
  params: Promise<{ projectsId: string }>
}
const page = async ({ params }: props) => {
  const { projectsId } = await params
  return <div>{projectsId}</div>
}

export default page
