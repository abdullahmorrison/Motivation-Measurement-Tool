import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client'
import { setContext } from "@apollo/client/link/context"

const httpLink = createHttpLink({
    uri: "https://motivationscale.up.railway.app",
})

//sending auth token with every server reqest
const authLink = setContext((_, { headers })=>{
  const token = localStorage.getItem("token")

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
    }
  }
})

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

export async function getScales() {
  const { data } = await client.query({
    query: gql`
        {
          scales {
            id
            username
            goal
            sliderValue
            chasingSuccessDescription
            avoidingFailureDescription
          }
        }`
  })

  return {
    props: {
      scales: data.scales,
    },
  }
}