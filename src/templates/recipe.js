import * as React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import {
    Container,
    Flex,
    Box,
    Space,
    Heading,
    Text,
    Avatar,
} from "../components/ui";
import { avatar as avatarStyle } from "../components/ui.css";
import * as styles from "./blog-post.css";
import SEOHead from "../components/head";
import { graphql } from 'gatsby';

export default function Recipe(props) {
    const author = false && props.author && (
        <Box center>
            <Flex>
                {props.author.avatar &&
                    (!!props.author.avatar.gatsbyImageData ? (
                        <Avatar
                            {...props.author.avatar}
                            image={props.author.avatar.gatsbyImageData}
                        />
                    ) : (
                        <img
                            src={props.author.avatar.url}
                            alt={props.author.name}
                            className={avatarStyle}
                        />
                    ))}
                <Text variant="bold">{props.author.name}</Text>
            </Flex>
        </Box>
    );

    return (
        <Layout>
            <Container>
                <Box paddingY={5}>
                    <Heading as="h1" center>
                        {props.title}
                    </Heading>
                    <Space size={4} />
                    {author}
                    <Space size={4} />
                    <Text center>{props.date}</Text>
                    <Space size={4} />
                    {props.image && (
                        <GatsbyImage
                            alt={props.image.alt}
                            image={props.image.gatsbyImageData}
                        />
                    )}
                    <Space size={5} />
                    <div
                        className={styles.blogPost}
                        dangerouslySetInnerHTML={{
                            __html: props.html,
                        }}
                    />
                    <pre>
                        {JSON.stringify(props, null, 2)}
                    </pre>
                </Box>
            </Container>
        </Layout>
    );
}
export const Head = (props) => {
    return <SEOHead {...props} description={props.description} />;
};


export const pageQuery = graphql`
query RecipeById(
    $id: String!
    $previousId: String
    $nextId: String
) {
    recipe(id: {eq: $id }) {
        calories
        cookingTime
        description
        ingredients
        preparationTime
        servings
        tags
        title
        totalTime
    }
    previous: recipe(id: {eq: $previousId }) {
        title
    }
    next: recipe(id: {eq: $nextId }) {
        title
    }
}
`;