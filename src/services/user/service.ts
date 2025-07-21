import { isDevelopmentStage } from '../../constants/appStages';
import { ACCESS_TOKEN_STORAGE_KEY } from '../../constants/auth';
import { BaseService } from '../baseService';
import { $api } from '../interceptor';
import { IUserStore, userStore } from './store';
import { IAuthResponse, IUser } from './types';

class UserAPI extends BaseService<IUserStore> {
  constructor() {
    super(userStore);
  }

  async getUserData() {
    try {
      this.setState({ isLoading: true });

      const { data } = await $api.get<IUser>('/user');

      this.setState({
        user: data,
      });
    } catch (error) {
      if (isDevelopmentStage) {
        console.log(error);
      }
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async login(email: string, password: string) {
    const { data } = await $api.post<IAuthResponse>('/login', {
      email,
      password,
    });

    this.setState({ user: data.user });

    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, data.token);

    return data;
  }

  async signup(invitation_token: string, password: string) {
    const { data } = await $api.post<IAuthResponse>('/signup', {
      invitation_token,
      password,
    });

    this.setState({ user: data.user });

    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, data.token);

    return data;
  }
}

export const userService = new UserAPI();
