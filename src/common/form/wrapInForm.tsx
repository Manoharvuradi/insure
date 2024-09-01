const getWrappedInForm = (submit: any, children: any) => {
  if (submit && children !== null) {
    return (
      <form onSubmit={submit} className="relative bg-white">
        {children}
      </form>
    );
  }
  return children;
};
