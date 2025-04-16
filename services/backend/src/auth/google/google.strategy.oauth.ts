/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { User } from '@/users/users.entity';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile, Strategy, StrategyOptions } from 'passport-google-oauth20';
import { Repository } from 'typeorm';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
      passReqToCallback: false,
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const { emails, id, displayName, photos } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      throw new Error('No email found in Google profile');
    }

    let user = await this.userRepository.findOne({
      where: [{ email }, { googleId: id }],
      relations: ['role'],
    });

    if (!user) {
      user = this.userRepository.create({
        email,
        googleId: id,
        username: displayName || email.split('@')[0],
        profilePicture: photos?.[0]?.value,
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        isActive: true,
      });
    } else {
      const updates: Partial<User> = {};

      if (id && user.googleId !== id) {
        updates.googleId = id;
      }

      if (photos?.[0]?.value && user.profilePicture !== photos[0].value) {
        updates.profilePicture = photos[0].value;
      }

      if (Object.keys(updates).length > 0) {
        await this.userRepository.update(user.id, updates);
        user = (await this.userRepository.findOne({
          where: { id: user.id },
          relations: ['role'],
        })) as User;
      }
    }

    return user;
  }
}
