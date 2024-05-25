<template>
      <v-container fluid class="fill-height">
        <v-row>
          <v-col cols="12" xs="12" sm="8" md="8" lg="7" class="ma-auto">
            <v-card class="" outlined :loading="loading">
              <v-row class="justify-space-between px-4 pt-6 pb-12">
                <v-col cols="12" sm="12" md="6">
                  <v-card-title class="text-center">OurGate</v-card-title>
                  <v-card-subtitle class="mb-5">Create your OurGate account</v-card-subtitle>
                  <v-card-text>
                    <ValidationObserver ref="form" v-slot="{ handleSubmit, reset }">
                      <form @submit.prevent="handleSubmit(handleSignUp)" @reset.prevent="reset">
                        <ValidationProvider v-slot="{ errors }" name="Email" rules="required|email">
                          <v-text-field
                            v-model="email"
                            :error-messages="errors"
                            label="Email"
                            class="mb-3"
                            outlined
                            dense
                          ></v-text-field>
                        </ValidationProvider>
                        <ValidationProvider v-slot="{ errors }" name="Channel Name" rules="required|min:3">
                          <v-text-field
                            v-model="channelName"
                            :error-messages="errors"
                            label="Channel Name"
                            outlined
                            dense
                          ></v-text-field>
                        </ValidationProvider>
                        <v-row>
                          <v-col cols="6">
                            <ValidationProvider v-slot="{ errors }" name="Password" rules="required|password:@confirm">
                              <v-text-field
                                v-model="password"
                                type="password"
                                :error-messages="errors"
                                label="Password"
                                outlined
                                dense
                              ></v-text-field>
                            </ValidationProvider>
                          </v-col>
                          <v-col cols="6">
                            <ValidationProvider v-slot="{ errors }" name="confirm" rules="required">
                              <v-text-field
                                type="password"
                                v-model="confirmPassword"
                                :error-messages="errors"
                                label="Confirm"
                                outlined
                                dense
                              ></v-text-field>
                            </ValidationProvider>
                          </v-col>
                        </v-row>
                        <div class="mt-6 d-flex justify-space-between">
                          <v-btn text small class="pl-0 text-capitalize" color="primary" router to="signin">Sign in instead</v-btn>
                          <v-btn type="submit" class="primary" :loading="loading" depressed>Sign up</v-btn>
                        </div>
                      </form>
                    </ValidationObserver>
                  </v-card-text>
                </v-col>
                <v-col cols="5" class="align-self-center hidden-sm-and-down">
                  <v-responsive>
                    <svg
                      id="b59c9f89-c93e-413f-a14b-776784e615e2"
                      data-name="Layer 1"
                      xmlns="http://www.w3.org/2000/svg"
                      style="max-width: 100%"
                      viewBox="0 0 1075.51587 646.89913"
                    >
                      <!-- SVG content here -->
                    </svg>
                  </v-responsive>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <script>
    import { mapActions } from 'vuex'

    export default {
      name: 'SignUp',
      data: () => ({
        email: '',
        channelName: '',
        password: '',
        confirmPassword: '',
        loading: false
      }),
      methods: {
        ...mapActions('auth', ['signUp']),
        async handleSignUp() {
          this.loading = true
          try {
            await this.signUp({
              email: this.email,
              channelName: this.channelName,
              password: this.password
            })
            this.$router.push({ name: 'Home' })
          } catch (err) {
            const errors = err.response.data.error
            this.$refs.form.setErrors({
              'Email': errors.find((error) => error.field === 'email')
                ? ['This email is already taken']
                : null,
              'Channel Name': errors.find((error) => error.field === 'channelName')
                ? ['This channel name is already taken']
                : null
            })
          } finally {
            this.loading = false
          }
        }
      }
    }
    </script>

    <style>
    </style>
