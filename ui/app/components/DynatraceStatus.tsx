import React, { useEffect, useState } from 'react';
import { Flex, Heading, Text, Container, ProgressCircle } from '@dynatrace/strato-components';
import './DynatraceStatus.css';

interface StatusComponent {
  name: string;
  status: string;
}

interface StatusData {
  status: {
    indicator: string;
    description: string;
  };
  components?: StatusComponent[];
}

/**
 * DynatraceStatus Component
 * Displays the current Dynatrace platform status from status.io
 */
const DynatraceStatus: React.FC = () => {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Fetch from Dynatrace status page API
        const response = await fetch('https://status.dynatrace.com/api/v2/status.json');
        
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        
        const data = await response.json();
        setStatus(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchStatus();
    // Refresh status every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (indicator: string): string => {
    switch (indicator) {
      case 'none':
        return 'status-operational';
      case 'minor':
        return 'status-minor';
      case 'major':
        return 'status-major';
      case 'critical':
        return 'status-critical';
      default:
        return 'status-unknown';
    }
  };

  const getStatusText = (indicator: string): string => {
    switch (indicator) {
      case 'none':
        return 'All Systems Operational';
      case 'minor':
        return 'Minor Service Outage';
      case 'major':
        return 'Major Service Outage';
      case 'critical':
        return 'Critical Service Outage';
      default:
        return 'Unknown Status';
    }
  };

  if (loading) {
    return (
      <Container>
        <Flex flexDirection="column" gap={16} padding={24} alignItems="center">
          <Heading level={3}>Dynatrace Platform Status</Heading>
          <ProgressCircle />
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Flex flexDirection="column" gap={16} padding={24}>
          <Heading level={3}>Dynatrace Platform Status</Heading>
          <Text>Unable to load status information</Text>
          <Text textStyle="small">
            <a href="https://dynatrace.status.io/" target="_blank" rel="noopener noreferrer">
              View status page →
            </a>
          </Text>
        </Flex>
      </Container>
    );
  }

  if (!status) {
    return null;
  }

  const statusClass = getStatusClass(status.status.indicator);
  const statusText = getStatusText(status.status.indicator);

  return (
    <Container>
      <Flex flexDirection="column" gap={16} padding={24}>
        <Flex alignItems="center" gap={12}>
          <div className={`status-indicator ${statusClass}`} />
          <Heading level={3}>Dynatrace Platform Status</Heading>
        </Flex>
        
        <Flex flexDirection="column" gap={8}>
          <Text textStyle="base-emphasized">{statusText}</Text>
          {status.status.description && (
            <Text>{status.status.description}</Text>
          )}
        </Flex>

        {status.components && status.components.length > 0 && (
          <Flex flexDirection="column" gap={8}>
            <Text textStyle="small-emphasized">Component Status:</Text>
            {status.components.slice(0, 5).map((component, index) => (
              <Flex key={index} alignItems="center" gap={8}>
                <div
                  className={`status-indicator-small ${
                    component.status === 'operational' ? 'status-operational' : 'status-minor'
                  }`}
                />
                <Text textStyle="small">{component.name}</Text>
              </Flex>
            ))}
          </Flex>
        )}

        <Text textStyle="small">
          <a href="https://dynatrace.status.io/" target="_blank" rel="noopener noreferrer">
            View full status page →
          </a>
        </Text>
      </Flex>
    </Container>
  );
};

export default DynatraceStatus;
