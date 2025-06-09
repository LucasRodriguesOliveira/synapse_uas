interface UpdateUserDto {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface UpdateUserById {
  id: string;
  userData: UpdateUserDto;
}
