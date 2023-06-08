import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import qs from 'qs';

import { CONFIRM_CHANGE_EMAIL } from '../../lib/graphql/user';
import { RootState } from '../../modules';
import { useApolloClient } from '@apollo/react-hooks';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import SpinnerBlock from '../../components/common/SpinnerBlock';

const mapStateToProps = (state: RootState) => ({});
const mapDispatchToProps = {};

interface OwnProps {}
type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
export type EmailChangeProps = OwnProps &
  StateProps &
  DispatchProps &
  RouteComponentProps;

const { useEffect, useCallback } = React;

const EmailChange: React.FC<EmailChangeProps> = ({ location, history }) => {
  const query = qs.parse(location.search, { ignoreQueryPrefix: true });
  const client = useApolloClient();
  useCallback(async () => {
    try {
      await client.mutate({
        mutation: CONFIRM_CHANGE_EMAIL,
        variables: {
          code: query.code,
        },
      });

      history.replace('/setting');
    } catch (e) {
      toast.error('잘못된 접근입니다.');
      history.replace('/');
    }
  }, [client, history, query.code]);

  useEffect(() => {
    if (!query.code) {
      // TODO: show 404
      toast.error('잘못된 접근입니다.');
      history.replace('/');
    }
  }, [history, location.search, query.code]);

  return (
    <Fullscreen>
      <SpinnerBlock />
    </Fullscreen>
  );
};

const Fullscreen = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(EmailChange));
